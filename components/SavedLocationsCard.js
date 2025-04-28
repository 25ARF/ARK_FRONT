import React from "react";
import styles from "./SavedLocationsCard.module.css";

/**
 * SavedLocationsCard 컴포넌트
 * 저장된 위치 목록을 표시하는 카드 컴포넌트입니다.
 * 위치 정보를 리스트로 표시하고 삭제 기능을 제공합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.savedLocations - 저장된 위치 목록 배열
 * @param {Function} props.onRemoveLocation - 위치 삭제 시 호출될 함수
 */
const SavedLocationsCard = ({ savedLocations, onRemoveLocation }) => {
  return (
    <div className={styles.card}>
      {/* 카드 제목 */}
      <h2>저장된 위치</h2>

      {/* 저장된 위치가 있을 경우 목록 표시 */}
      {savedLocations.length > 0 ? (
        <div className={styles.locationsList}>
          {savedLocations.map((place) => (
            <div key={place.id} className={styles.locationItem}>
              {/* 위치 정보 */}
              <div className={styles.placeInfo}>
                <div className={styles.placeName}>{place.place_name}</div>
                <div className={styles.address}>{place.address_name}</div>
              </div>

              {/* 삭제 버튼 */}
              <button
                className={styles.removeButton}
                onClick={() => onRemoveLocation(place.id)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      ) : (
        // 저장된 위치가 없을 경우 안내 메시지
        <div className={styles.emptyMessage}>저장된 위치가 없습니다.</div>
      )}
    </div>
  );
};

export default SavedLocationsCard;
