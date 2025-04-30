import styles from "./Header.module.css";
import { BuildingDropdown } from "./BuildingDropdown";
import { useState } from "react";

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
  const [selectedBuilding, setSelectedBuilding] = useState("다산정보관");

  const handleBuildingChange = (building) => {
    setSelectedBuilding(building);
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
            selectedBuilding={selectedBuilding}
            onBuildingChange={handleBuildingChange}
          />
        </div>
      </header>
    </div>
  );
}
