import styles from "./Header.module.css";
import { BuildingDropdown } from "./BuildingDropdown";
import { useState, useEffect } from "react";
import { useBuilding } from "../contexts/BuildingContext";
import AddressSearchInput from "./AddressSearchInput";
import AddressSearchResults from "./AddressSearchResults";
import BuildingListCard from "./BuildingListCard";
import axios from "../lib/axios";

/**
 * Header 컴포넌트
 * 애플리케이션 상단에 표시되는 헤더 컴포넌트입니다.
 * 현재 페이지 제목과 추가 컨트롤을 표시합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onToggleRightSidebar - 우측 사이드바 토글 핸들러 함수
 * @param {Function} props.onToggleSidebar - 사이드바 토글 핸들러 함수
 * @param {Boolean} props.isMobileView - 모바일 화면 여부
 */
export default function Header({
  onToggleRightSidebar,
  onToggleSidebar,
  isMobileView,
}) {
  const { selectedBuilding, setSelectedBuilding } = useBuilding();
  const [headerSelectedBuilding, setHeaderSelectedBuilding] = useState(
    selectedBuilding?.name || ""
  );
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buildings, setBuildings] = useState([]);

  // 컴포넌트 마운트 시 건물 목록 가져오기
  useEffect(() => {
    fetchBuildings();
  }, []);

  // 건물 목록 가져오기 함수
  const fetchBuildings = async () => {
    try {
      const response = await axios.get("/buildings");
      setBuildings(response.data);
    } catch (error) {
      console.error("건물 목록 가져오기 실패:", error);
    }
  };

  // selectedBuilding이 변경될 때 headerSelectedBuilding도 업데이트
  useEffect(() => {
    if (selectedBuilding?.name) {
      setHeaderSelectedBuilding(selectedBuilding.name);
    }
  }, [selectedBuilding]);

  // BuildingContext의 selectedBuilding이 변경될 때 맵 이동
  useEffect(() => {
    // 건물 정보가 있고 좌표가 있는 경우에만 맵 이동 이벤트 발생
    if (selectedBuilding && selectedBuilding.location) {
      const event = new CustomEvent("buildingSelect", {
        detail: selectedBuilding,
      });
      window.dispatchEvent(event);
    }
  }, [selectedBuilding]);

  const handleBuildingChange = (buildingName) => {
    setHeaderSelectedBuilding(buildingName);
  };

  const togglePopup = () => {
    const newShowPopup = !showPopup;
    setShowPopup(newShowPopup);

    // 팝업이 열릴 때마다 건물 목록을 새로 가져옴
    if (newShowPopup) {
      fetchBuildings();
    }
  };

  // 주소 검색 핸들러
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

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

  // 건물 추가 핸들러
  const handleAddBuilding = async (place) => {
    try {
      const buildingData = {
        id: place.id, // 카카오 API의 ID를 그대로 사용
        name: place.place_name,
        address: place.address_name,
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
        measurements: [],
      };

      const response = await axios.post("/buildings", buildingData);
      const data = response.data;

      console.log("새 건물이 저장되었습니다:", data);

      // 건물 목록 새로고침
      fetchBuildings();

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

  return (
    <div className={styles.headerContainer}>
      <header className={styles.header}>
        {/* 모바일 화면에서 사이드바 토글 버튼 표시 */}
        {isMobileView && (
          <button
            className={styles.sidebarToggleButton}
            onClick={onToggleSidebar}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="#A5A6B9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div className={styles.headerContent}>
          <BuildingDropdown
            selectedBuilding={headerSelectedBuilding}
            onBuildingChange={handleBuildingChange}
          />
          <button
            className={styles.infoButton}
            onClick={togglePopup}
            aria-label="검색하기"
          >
            <img src="/plus.svg" width="24" height="24" alt="추가" />
          </button>
        </div>
      </header>

      {/* 검색 팝업 */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3>주소 검색</h3>
              <button
                className={styles.closeButton}
                onClick={togglePopup}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className={styles.popupContent}>
              {/* 검색 입력 폼 */}
              <AddressSearchInput
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
              />

              {/* 검색 결과 목록 */}
              <div className={styles.searchResultsWrapper}>
                <AddressSearchResults
                  searchResults={searchResults}
                  isLoading={isLoading}
                  error={error}
                  onAddressSelect={handleAddBuilding}
                  onAddBuilding={handleAddBuilding}
                  selectedBuildings={buildings}
                />
              </div>

              {/* 건물 목록 */}
              <div className={styles.buildingListSection}>
                <div className={styles.buildingListWrapper}>
                  <BuildingListCard height="250px" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
