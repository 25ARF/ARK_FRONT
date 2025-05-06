import React, { useState, useEffect } from "react";
import styles from "./CrackStatsCard.module.css";
import axios from "../lib/axios";

const CrackStatsCard = () => {
  const [buildingStats, setBuildingStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/buildings");

        // 응답 데이터가 배열인지 확인
        const buildings = Array.isArray(response.data) ? response.data : [];
        const stats = calculateBuildingStats(buildings);
        setBuildingStats(stats);
      } catch (error) {
        console.error("건물 데이터를 가져오는 중 오류 발생:", error);
        setBuildingStats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuildingData();
  }, []);

  // 건물별 균열 통계 계산 함수
  const calculateBuildingStats = (buildings) => {
    // 현재 달과 이전 달 구하기
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript는 0부터 시작하므로 +1

    // 이전 달 계산 (1월이면 이전 해 12월)
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 현재 달과 이전 달의 날짜 형식 문자열 준비 (YYYY-MM)
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(
      2,
      "0"
    )}`;
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

    return buildings.map((building, index) => {
      let currentMonthCount = 0;
      let previousMonthCount = 0;

      // 각 건물의 측정 포인트 수 계산
      const crackCount = building.measurements.length;

      // 건물의 각 측정 포인트 순회
      building.measurements.forEach((point) => {
        if (point.measurements && point.measurements.length > 0) {
          // 현재 달 데이터 확인
          const currentMonthData = point.measurements.filter((m) =>
            m.date.startsWith(currentMonthStr)
          );

          // 이전 달 데이터 확인
          const prevMonthData = point.measurements.filter((m) =>
            m.date.startsWith(prevMonthStr)
          );

          // 현재 달에 측정 데이터가 있으면 카운트 증가
          if (currentMonthData.length > 0) {
            currentMonthCount++;
          }

          // 이전 달에 측정 데이터가 있으면 카운트 증가
          if (prevMonthData.length > 0) {
            previousMonthCount++;
          }
        }
      });

      // 변화량 계산
      const change = currentMonthCount - previousMonthCount;

      return {
        id: building.id,
        name: building.name,
        crackCount,
        currentMonthCount,
        previousMonthCount,
        change,
        trend: change > 0 ? "up" : change < 0 ? "down" : "same",
      };
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>건물별 균열 수</h2>
      </div>
      <div className={styles.cardContent}>
        {isLoading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : (
          <>
            <div className={styles.tableHeader}>
              <div className={styles.buildingColumn}>건물</div>
              <div className={styles.crackCountColumn}>균열 수</div>
              <div className={styles.changeColumn}>지난 달 대비</div>
            </div>
            <div className={styles.tableBody}>
              {buildingStats.length > 0 ? (
                buildingStats.map((building) => (
                  <div key={building.id} className={styles.tableRow}>
                    <div className={styles.buildingColumn}>{building.name}</div>
                    <div className={styles.crackCountColumn}>
                      {building.crackCount}건
                    </div>
                    <div
                      className={`${styles.changeColumn} ${
                        styles[building.trend]
                      }`}
                    >
                      {building.trend === "up" && (
                        <span className={styles.triangleUp}>▲</span>
                      )}
                      {building.trend === "down" && (
                        <span className={styles.triangleDown}>▼</span>
                      )}
                      {building.change > 0 ? "+" : ""}
                      {building.change}건
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>건물 데이터가 없습니다.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrackStatsCard;
