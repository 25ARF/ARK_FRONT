import React from "react";
import styles from "./BuildingCrackCountCard.module.css";

const BuildingCrackCountCard = () => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>건물별 군집 수</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.centerText}>균열 군집 수 표시 카드</div>
      </div>
    </div>
  );
};

export default BuildingCrackCountCard;
