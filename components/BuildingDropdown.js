"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./BuildingDropdown.module.css";
import axios from "../lib/axios";
import { useBuilding } from "../contexts/BuildingContext";

export function BuildingDropdown({
  selectedBuilding: externalSelectedBuilding,
  onBuildingChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    selectedBuilding: contextBuilding,
    setSelectedBuilding: setContextBuilding,
  } = useBuilding();
  const [localSelectedBuilding, setLocalSelectedBuilding] = useState(
    externalSelectedBuilding
  );

  // 컴포넌트 마운트 시 건물 목록 가져오기
  useEffect(() => {
    fetchBuildings();
  }, []);

  // API에서 건물 목록 가져오기
  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/buildings");
      const buildingList = response.data;

      if (buildingList && buildingList.length > 0) {
        setBuildings(buildingList);

        // 처음 로드 시 기본 선택 건물 설정
        if (!localSelectedBuilding && buildingList.length > 0) {
          const defaultBuilding = buildingList[0];
          setLocalSelectedBuilding(defaultBuilding.name);
          onBuildingChange(defaultBuilding.name);
          setContextBuilding(defaultBuilding);

          // 첫 로드 시 기본 선택 건물로 맵 이동
          moveMapToBuilding(defaultBuilding);
        }
      }
    } catch (error) {
      console.error("건물 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 선택한 건물로 맵 이동 함수
  const moveMapToBuilding = (building) => {
    if (building && building.location) {
      // buildingSelect 이벤트 발생
      const event = new CustomEvent("buildingSelect", {
        detail: building,
      });
      window.dispatchEvent(event);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectBuilding = (building) => {
    setLocalSelectedBuilding(building.name);

    // 부모 컴포넌트에 변경 알림
    onBuildingChange(building.name);

    // BuildingContext에 선택된 건물 정보 저장
    setContextBuilding(building);

    // 선택한 건물로 맵 이동
    moveMapToBuilding(building);

    setIsOpen(false);
  };

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={loading}
      >
        <span>{loading ? "로딩 중..." : localSelectedBuilding}</span>
        <ChevronDown
          className={`${styles.icon} ${isOpen ? styles.iconRotated : ""}`}
        />
      </button>

      {isOpen && !loading && (
        <div className={styles.dropdownMenu} role="listbox">
          {buildings.map((building) => (
            <div
              key={building.id}
              className={`${styles.dropdownItem} ${
                localSelectedBuilding === building.name ? styles.selected : ""
              }`}
              onClick={() => selectBuilding(building)}
              role="option"
              aria-selected={localSelectedBuilding === building.name}
            >
              {building.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
