import { useState, useEffect } from "react";
import axios from "../lib/axios";
import styles from "./CrackStatCard.module.css";

export default function CrackStatCard() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await axios.get("/buildings");
        setBuildings(response.data);
        setLoading(false);
      } catch (err) {
        console.error("건물 데이터 로딩 중 오류 발생:", err);
        setError("건물 데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>건물별 균열 수</h3>
      </div>
      <div className={styles.cardContent}>
        {buildings.map((building) => (
          <div key={building.id} className={styles.buildingItem}>
            <div className={styles.buildingInfo}>
              <h4>{building.name}</h4>
              <p>{building.address}</p>
            </div>
            <div className={styles.crackCount}>
              <span className={styles.count}>
                {building.measurements?.length || 0}
              </span>
              <span className={styles.label}>균열</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
