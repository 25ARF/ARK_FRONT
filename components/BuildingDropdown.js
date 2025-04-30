"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./BuildingDropdown.module.css";
import axios from "../lib/axios";
import { useBuilding } from "../contexts/BuildingContext";

const BuildingDropdown = ({ selectedBuilding, onBuildingChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const { setSelectedBuilding } = useBuilding();

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await axios.get("/buildings");
      setBuildings(response.data);

      // 첫 번째 건물을 기본값으로 설정
      if (response.data.length > 0) {
        const firstBuilding = response.data[0];
        setSelectedBuilding(firstBuilding);
        onBuildingChange(firstBuilding);
      }
    } catch (error) {
      console.error("건물 데이터 로딩 실패:", error);
      setError("건물 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectBuilding = (building) => {
    setSelectedBuilding(building);
    onBuildingChange(building);
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

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (error) {
    return <div className={styles.container}>{error}</div>;
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedBuilding?.name || "건물 선택"}</span>
        <ChevronDown
          className={`${styles.icon} ${isOpen ? styles.iconRotated : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          {buildings.map((building) => (
            <div
              key={building.id}
              className={`${styles.dropdownItem} ${
                selectedBuilding?.id === building.id ? styles.selected : ""
              }`}
              onClick={() => selectBuilding(building)}
              role="option"
              aria-selected={selectedBuilding?.id === building.id}
            >
              {building.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildingDropdown;
