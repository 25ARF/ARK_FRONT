import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CesiumMap from "../components/CesiumMap";
import BuildingListCard from "../components/BuildingListCard";
import SelectedBuilding from "../components/SelectedBuilding";
import AddressSearchInput from "../components/AddressSearchInput";
import AddressSearchResults from "../components/AddressSearchResults";
import styles from "./SearchPage.module.css";
import axios from "../lib/axios";
import VWorldMap from "../components/VWorldMaps";
import { useRouter } from "next/router";

/**
 * 검색 페이지 컴포넌트
 * 주소 검색 및 지도 표시 기능을 제공하는 페이지입니다.
 * 사용자는 주소를 검색하고 결과를 지도에서 확인할 수 있습니다.
 */
const SearchPage = () => {
  // 상태 관리
  const [searchQuery, setSearchQuery] = useState(""); // 검색어
  const [searchResults, setSearchResults] = useState(null); // 검색 결과
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 오류 상태
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateBuilding, setDuplicateBuilding] = useState(null);
  const router = useRouter();

  // 페이지 로드 시 중복 건물 알림 모달 상태 초기화
  useEffect(() => {
    setShowDuplicateModal(false);
    setDuplicateBuilding(null);
  }, []);

  // 중복 건물 알림 모달이 표시되면 5초 후 자동으로 닫기
  useEffect(() => {
    let timer;
    if (showDuplicateModal) {
      timer = setTimeout(() => {
        setShowDuplicateModal(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showDuplicateModal]);

  /**
   * 주소 검색 핸들러
   * 카카오 로컬 API를 사용하여 주소를 검색합니다.
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
   * 검색 결과에서 선택한 주소를 처리합니다.
   * @param {Object} place - 선택된 장소 정보 (카카오 API 응답 형식)
   */
  const handleAddressSelect = async (place) => {
    try {
      const buildingData = {
        name: place.place_name,
        address: place.address_name,
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
        measurements: [],
      };

      const response = await fetch("/api/buildings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildingData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          // 중복 건물인 경우
          setDuplicateBuilding(data.building);
          setShowDuplicateModal(true);
          return;
        }
        throw new Error("건물 데이터 저장 실패");
      }

      console.log("새 건물이 저장되었습니다:", data);

      // 주소 선택 이벤트 발생
      const event = new CustomEvent("addressSelect", {
        detail: {
          ...place,
          buildingId: data.id,
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("건물 저장 중 오류 발생:", error);
      alert("건물 정보 저장 중 오류가 발생했습니다.");
    }
  };

  // 페이지 렌더링
  return (
    <div className={styles.container}>
      {/* 좌측 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className={styles.contentContainer}>
        {/* 상단 헤더 */}
        <Header />

        {/* 메인 콘텐츠 */}
        <main className={styles.main}>
          <div className={styles.dashboardFlex}>
            {/* 지도 및 검색 섹션 */}
            <div className={styles.mapSection}>
              {/* 검색 입력 폼 */}
              <div className={styles.searchInputContainer}>
                <AddressSearchInput
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onSearch={handleSearch}
                />
              </div>

              {/* 지도 컨테이너 */}
              <div className={styles.mapContainer}>
                <CesiumMap />
              </div>

              {/* 검색 결과 목록 */}
              <div className={styles.searchResultsContainer}>
                <AddressSearchResults
                  searchResults={searchResults}
                  isLoading={isLoading}
                  error={error}
                  onAddressSelect={handleAddressSelect}
                />
              </div>
            </div>

            {/* 우측 정보 카드 섹션 */}
            <div className={styles.cardSection}>
              {/* 건물 목록 카드 */}
              <div className={styles.flexItem}>
                <BuildingListCard height="26rem" />
              </div>

              {/* 선택된 건물 정보 카드 */}
              <div className={styles.flexItem}>
                <SelectedBuilding />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 중복 건물 알림 모달 */}
      {showDuplicateModal && duplicateBuilding && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>이미 등록된 건물입니다.</h3>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowDuplicateModal(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
