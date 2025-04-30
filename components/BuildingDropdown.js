"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./BuildingDropdown.module.css";

export function BuildingDropdown({ selectedBuilding, onBuildingChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const buildings = [
    "다산정보관",
    "학술정보관",
    "제1공학관",
    "제2공학관",
    "학생회관",
    "대강당",
    "본관",
    "창의관",
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectBuilding = (building) => {
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

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{selectedBuilding}</span>
        <ChevronDown
          className={`${styles.icon} ${isOpen ? styles.iconRotated : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          {buildings.map((building) => (
            <div
              key={building}
              className={`${styles.dropdownItem} ${
                selectedBuilding === building ? styles.selected : ""
              }`}
              onClick={() => selectBuilding(building)}
              role="option"
              aria-selected={selectedBuilding === building}
            >
              {building}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
