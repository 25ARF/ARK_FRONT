import styles from "./Header.module.css";
import { BuildingDropdown } from "./BuildingDropdown";
import { useState, useEffect } from "react";
import { useBuilding } from "../contexts/BuildingContext";

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
    setShowPopup(!showPopup);
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
            aria-label="정보 보기"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16V12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8H12.01"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* 정보 팝업 */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3>건물 정보</h3>
              <button
                className={styles.closeButton}
                onClick={togglePopup}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className={styles.popupContent}>
              {selectedBuilding && (
                <div>
                  <p>
                    <strong>건물명:</strong> {selectedBuilding.name}
                  </p>
                  {selectedBuilding.location && (
                    <p>
                      <strong>위치:</strong> 위도{" "}
                      {selectedBuilding.location.latitude.toFixed(6)}, 경도{" "}
                      {selectedBuilding.location.longitude.toFixed(6)}
                    </p>
                  )}
                  <p>
                    <strong>웨이포인트 수:</strong>{" "}
                    {selectedBuilding.measurements?.length || 0}개
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
