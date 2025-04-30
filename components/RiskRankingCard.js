// components/RiskRankingCard.js
import React, { useState, useEffect } from "react";
import styles from "./RiskRankingCard.module.css";
import { Icon } from "@iconify/react";
import { useBuilding } from "../contexts/BuildingContext";

/**
 * RiskRankingCard 컴포넌트
 * 균열 폭 확장 속도 순위를 표시합니다.
 */
const RiskRankingCard = () => {
  // 상태 관리
  const { selectedBuilding } = useBuilding();
  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 선택된 건물이 변경되면 위험도 데이터 처리
  useEffect(() => {
    if (selectedBuilding) {
      processRiskData(selectedBuilding);
    } else {
      setRiskData([]);
      setLoading(false);
    }
  }, [selectedBuilding]);

  /**
   * 위험도 데이터 처리 함수
   * 건물의 측정 데이터를 분석하여 균열 위험도를 계산합니다.
   * @param {Object} building - 선택된 건물 데이터
   */
  const processRiskData = (building) => {
    if (!building || !building.measurements) {
      setRiskData([]);
      return;
    }

    // 각 웨이포인트의 최신 측정값과 위험도 계산
    const riskPoints = building.measurements.map((waypoint) => {
      // 측정값들을 날짜순으로 정렬
      const sortedMeasurements = [...waypoint.measurements].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // 최신 측정값
      const latestMeasurement =
        sortedMeasurements[sortedMeasurements.length - 1];

      // 증가율 계산 (이전 측정값이 있는 경우에만)
      let growthRate = 0;
      if (sortedMeasurements.length > 1) {
        const previousMeasurement =
          sortedMeasurements[sortedMeasurements.length - 2];

        // 날짜 차이 계산 (일 단위)
        const timeDiff =
          (new Date(latestMeasurement.date) -
            new Date(previousMeasurement.date)) /
          (1000 * 60 * 60 * 24);

        // 균열 폭 차이 계산 (mm 단위)
        const widthDiff =
          latestMeasurement.width_mm - previousMeasurement.width_mm;

        // 주간 증가율 계산 (mm/주)
        growthRate = (widthDiff / timeDiff) * 7;
      }

      // 위험도 계산 (주간 증가율에 따른 분류)
      let riskLevel;
      if (growthRate >= 1.6) {
        riskLevel = "high";
      } else if (growthRate >= 0.7) {
        riskLevel = "medium";
      } else {
        riskLevel = "low";
      }

      // 라벨에서 "WP X" 부분 추출
      const match = waypoint.label.match(/WP \d+$/);
      const wpId = match ? match[0] : waypoint.label; // 매칭되는 부분이 없으면 전체 라벨 사용

      return {
        id: wpId, // 추출된 "WP X" 사용
        rate: `${growthRate.toFixed(1)}mm/week`,
        riskLevel,
        width: latestMeasurement.width_mm,
      };
    });

    // 증가율 순으로 정렬
    riskPoints.sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));

    setRiskData(riskPoints);
    setLoading(false);
  };

  /**
   * 위험도에 따른 색상 반환 함수
   * @param {string} riskLevel - 위험도 수준
   * @returns {string} - 해당 위험도를 표현하는 색상 코드
   */
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "high":
        return "#ff4444"; // 빨간색
      case "medium":
        return "#ffbb33"; // 노란색
      case "low":
        return "#00C851"; // 초록색
      default:
        return "#2BBBAD"; // 기본 색상 (청록색)
    }
  };

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.headerWithIcon}>
          <div className={styles.iconContainer}>
            <Icon
              icon="material-symbols:fact-check-outline"
              className={styles.listIcon}
              style={{ color: "#000000" }}
            />
          </div>
          <h2 className={styles.title}>균열 폭 확장 속도 순위</h2>
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  // 메인 컴포넌트 렌더링
  return (
    <div className={styles.card}>
      {/* 카드 헤더 */}
      <div className={styles.headerWithIcon}>
        <div className={styles.iconContainer}>
          <Icon
            icon="material-symbols:fact-check-outline"
            className={styles.listIcon}
            style={{ color: "#000000" }}
          />
        </div>
        <h2 className={styles.title}>균열 폭 확장 속도 순위</h2>
      </div>

      {/* 헤더 행 (컬럼 제목) */}
      <div className={styles.tableHeader}>
        <div className={styles.wpColumn}>WP</div>
        <div className={styles.rateColumn}>확장속도</div>
        <div className={styles.riskColumn}>위험도</div>
      </div>

      {/* 구분선 */}
      <div className={styles.divider}></div>

      {/* 균열 확장 속도 목록 */}
      <div className={styles.list}>
        {riskData.length === 0 ? (
          <div className={styles.emptyMessage}>
            {selectedBuilding
              ? "해당 건물의 측정 데이터가 없습니다."
              : "건물을 선택해주세요."}
          </div>
        ) : (
          riskData.map((item) => (
            <div key={item.id} className={styles.expansionItem}>
              <div className={styles.wpColumn}>{item.id}</div>
              <div className={styles.rateColumn}>{item.rate}</div>
              <div className={styles.riskColumn}>
                <div
                  className={styles.riskIndicator}
                  style={{ backgroundColor: getRiskColor(item.riskLevel) }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RiskRankingCard;
