// components/MapCard.js
import styles from "./MapCard.module.css";
import CesiumMap from "./CesiumMap";

/**
 * MapCard 컴포넌트
 * 3D 지도를 표시하는 카드 컴포넌트입니다.
 * CesiumMap 컴포넌트를 감싸서 일관된 카드 스타일로 표시합니다.
 * 대시보드 그리드 레이아웃에 맞게 크기와 스타일을 조정합니다.
 */
export default function MapCard() {
  return (
    <div className={styles.card}>
      {/* 지도 컨테이너 */}
      <div className={styles.mapPlaceholder}>
        {/* Cesium 3D 지도 컴포넌트 */}
        <CesiumMap />
      </div>
    </div>
  );
}
