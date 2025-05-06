import React from "react";
import styles from "./AddressSearchInput.module.css";

/**
 * AddressSearchInput 컴포넌트
 * 주소 검색을 위한 입력 폼 컴포넌트입니다.
 * 검색어 입력 및 검색 기능을 제공합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.searchQuery - 검색어 상태
 * @param {Function} props.setSearchQuery - 검색어 상태 업데이트 함수
 * @param {Function} props.onSearch - 검색 실행 함수
 */
const AddressSearchInput = ({
  searchQuery,
  setSearchQuery = () => {},
  onSearch = () => {},
}) => {
  return (
    <div className={styles.searchContainer}>
      {/* 검색어 입력 필드 */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="예) 다산정보관"
        className={styles.searchInput}
        onKeyPress={(e) => e.key === "Enter" && onSearch()} // Enter 키 누르면 검색 실행
      />

      {/* 검색 버튼 */}
      <button onClick={onSearch} className={styles.searchIcon}>
        <img src="/search_icon.svg" alt="검색" />
      </button>
    </div>
  );
};

export default AddressSearchInput;
