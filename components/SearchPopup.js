import React from "react";
import styles from "./SearchPopup.module.css";

/**
 * SearchPopup 컴포넌트
 * 검색 결과를 팝업 형태로 표시하는 모달 컴포넌트입니다.
 * 검색된 장소 목록을 표시하고 선택할 수 있게 합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.isOpen - 팝업 열림 상태
 * @param {Function} props.onClose - 팝업 닫기 함수
 * @param {Array} props.searchResults - 검색 결과 배열
 * @param {Function} props.onSelectLocation - 장소 선택 시 호출될 함수
 */
const SearchPopup = ({ isOpen, onClose, searchResults, onSelectLocation }) => {
  // 팝업이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) return null;

  /**
   * 오버레이 영역 클릭 핸들러
   * 팝업 외부 영역(오버레이) 클릭 시 팝업을 닫습니다.
   * @param {Event} e - 클릭 이벤트 객체
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup}>
        {/* 팝업 헤더 */}
        <div className={styles.header}>
          <h3>검색 결과</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 팝업 내용 */}
        <div className={styles.content}>
          {searchResults.length > 0 ? (
            // 검색 결과가 있는 경우
            <div className={styles.resultsList}>
              {searchResults.map((place) => (
                <div
                  key={place.id}
                  className={styles.resultItem}
                  onClick={() => {
                    onSelectLocation(place);
                    onClose();
                  }}
                >
                  {/* 장소명 (건물명, 시설명 등) */}
                  <div className={styles.placeName}>{place.place_name}</div>
                  {/* 주소 */}
                  <div className={styles.address}>{place.address_name}</div>
                </div>
              ))}
            </div>
          ) : (
            // 검색 결과가 없는 경우
            <div className={styles.noResults}>검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
