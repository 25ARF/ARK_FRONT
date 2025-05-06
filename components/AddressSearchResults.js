import React from "react";
import styles from "./AddressSearchResults.module.css";

/**
 * AddressSearchResults 컴포넌트
 * 주소 검색 결과를 표시하는 컴포넌트입니다.
 * 로딩 상태, 오류, 검색 결과에 따라 다른 내용을 표시합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.searchResults - 검색 결과 배열
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {string|null} props.error - 오류 메시지
 * @param {Function} props.onAddressSelect - 주소 선택 시 호출될 함수
 */
const AddressSearchResults = ({
  searchResults = [],
  isLoading,
  error,
  onAddressSelect = () => {},
}) => {
  /**
   * 컨텐츠 렌더링 함수
   * 상태에 따라 적절한 내용을 렌더링합니다.
   * @returns {JSX.Element} 상태에 맞는 컴포넌트
   */
  const renderContent = () => {
    // 로딩 중인 경우
    if (isLoading) {
      return <div className={styles.message}>검색 중...</div>;
    }

    // 오류가 발생한 경우
    if (error) {
      return <div className={styles.message}>{error}</div>;
    }

    // 검색 결과가 없는 경우
    if (!searchResults || searchResults.length === 0) {
      return (
        <div className={styles.message}>
          {searchResults === null
            ? "건물명 또는 주소를 입력해 주세요."
            : "검색 결과가 없습니다."}
        </div>
      );
    }

    // 검색 결과가 있는 경우
    return (
      <div className={styles.resultsList}>
        {searchResults.map((place) => (
          <div
            key={place.id}
            className={styles.resultItem}
            onClick={() => onAddressSelect(place)}
          >
            {/* 장소 이름 (건물명, 시설명 등) */}
            <div className={styles.placeName}>{place.place_name}</div>
            {/* 주소 */}
            <div className={styles.addressName}>{place.address_name}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.resultsContainer}>
      {/* 결과 컨테이너 제목 */}
      <div className={styles.resultsHeader}>주소</div>
      {/* 동적 컨텐츠 렌더링 */}
      {renderContent()}
    </div>
  );
};

export default AddressSearchResults;
