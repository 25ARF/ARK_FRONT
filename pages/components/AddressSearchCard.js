import React, { useState } from "react";
import styles from "./AddressSearchCard.module.css";
import AddressSearchInput from "./AddressSearchInput";
import AddressSearchResults from "./AddressSearchResults";

/**
 * AddressSearchCard 컴포넌트
 * 주소 검색 기능을 제공하는 카드 컴포넌트입니다.
 * 검색 입력폼과 검색 결과를 하나의 카드에 통합해서 표시합니다.
 * 카카오 로컬 API를 사용하여 주소를 검색합니다.
 */
const AddressSearchCard = () => {
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState(""); // 검색어
  const [searchResults, setSearchResults] = useState([]); // 검색 결과
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 오류 메시지

  /**
   * 주소 검색 핸들러
   * 카카오 로컬 API를 호출하여 검색어에 해당하는 주소를 검색합니다.
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // 빈 검색어는 무시

    setIsLoading(true);
    setError(null);

    try {
      // 카카오 로컬 API 호출
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      // 응답 데이터 처리
      const data = await response.json();
      setSearchResults(data.documents || []);
    } catch (error) {
      console.error("주소 검색 실패:", error);
      setError("주소 검색에 실패했습니다.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 주소 선택 핸들러
   * 검색 결과에서 선택한 주소 정보를 이벤트로 발생시킵니다.
   * @param {Object} place - 선택된 장소 정보 (카카오 API 응답 형식)
   */
  const handleAddressSelect = (place) => {
    // 필수 속성 검증
    if (!place || !place.x || !place.y || !place.place_name) {
      console.error("잘못된 장소 데이터:", place);
      return;
    }

    console.log("주소 선택 이벤트 발생:", place);

    // 주소 선택 이벤트 발생 (지도 컴포넌트에서 감지)
    const event = new CustomEvent("addressSelect", {
      detail: {
        id: place.id || Date.now().toString(),
        x: place.x,
        y: place.y,
        place_name: place.place_name,
        address_name: place.address_name || "",
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={styles.card}>
      {/* 주소 검색 입력 컴포넌트 */}
      <AddressSearchInput
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* 주소 검색 결과 컴포넌트 */}
      <AddressSearchResults
        searchResults={searchResults}
        isLoading={isLoading}
        error={error}
        onAddressSelect={handleAddressSelect}
      />
    </div>
  );
};

export default AddressSearchCard;
