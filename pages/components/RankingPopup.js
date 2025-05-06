// components/RankingPopup.js
import React from "react";
import styles from "./RankingPopup.module.css"; // 팝업 스타일을 위한 CSS 모듈

/**
 * RankingPopup 컴포넌트
 * 전체 위험도 순위를 팝업 형태로 표시하는 모달 컴포넌트입니다.
 * 각 항목의 순위, 설명, 진행 상태를 시각적으로 표현합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.rankings - 순위 데이터 배열 [{rank, description, value}]
 * @param {Function} props.onClose - 팝업 닫기 함수
 */
const RankingPopup = ({ rankings, onClose }) => {
  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        {/* 팝업 제목 */}
        <h3>전체 위험 순위</h3>

        {/* 닫기 버튼 */}
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>

        {/* 순위 목록 */}
        {rankings.map((item) => (
          <div key={item.rank} className={styles.rankingItem}>
            {/* 순위 번호 */}
            <span className={styles.rank}>{item.rank}</span>

            {/* 항목 설명 */}
            <span className={styles.description}>{item.description}</span>

            {/* 진행 상태 막대 */}
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankingPopup;
