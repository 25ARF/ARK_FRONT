import React from "react";
import styles from "./SelectedBuilding.module.css";

/**
 * SelectedBuilding 컴포넌트
 * 선택된 건물의 정보를 표시하는 컴포넌트입니다.
 * 건물이 선택되었을 때 해당 건물의 상세 정보를 보여줍니다.
 */
const SelectedBuilding = () => {
  return (
    <div className={styles.card}>
      {/* 카드 제목 */}
      <h2 className={styles.title}>선택된 건물</h2>

      {/* 카드 내용 영역 */}
      <div className={styles.content}>
        <p>건물을 선택하면 상세 정보가 표시됩니다.(미구현현)</p>
      </div>
    </div>
  );
};

export default SelectedBuilding;
