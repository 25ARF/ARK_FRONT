import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Sidebar.module.css";
import AddressSearchInput from "./AddressSearchInput";
import AddressSearchResults from "./AddressSearchResults";
import KakaoMap from "./KakaoMap";

export default function Sidebar() {
  const [panelOpen, setPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBuildings, setSelectedBuildings] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
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

  const handleAddBuilding = (place) => {
    if (!place || !place.id) return;
    if (selectedBuildings.some((b) => b.id === place.id)) return;
    setSelectedBuildings((prev) => [...prev, place]);
  };

  const handleRemoveBuilding = (id) => {
    setSelectedBuildings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddressSelect = (place) => {
    if (!place || !place.x || !place.y || !place.place_name) return;

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
    <div className={styles.container}>
      <div className={styles.mainSidebar}>
        <Link href="/">
          <img src="/logo.svg" alt="대시보드" width={32} height={32} />
        </Link>
        <Link href="/search">
          <img src="/address.svg" alt="주소 검색" width={32} height={32} />
        </Link>
      </div>

      <div
        className={`${styles.buildingPanelWrapper} ${
          panelOpen ? styles.open : styles.closed
        }`}
      >
        <div className={styles.buildingPanel}>
          <div className={styles.panelContent}>
            <h3>건물 등록 및 선택</h3>

            <AddressSearchInput
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
            />

            <AddressSearchResults
              searchResults={searchResults}
              isLoading={isLoading}
              error={error}
              onAddressSelect={handleAddressSelect}
              onAddBuilding={handleAddBuilding}
              selectedBuildings={selectedBuildings}
            />

            <div className={styles.mapPlaceholder}>
              <KakaoMap />
            </div>

            <ul className={styles.buildingList}>
              <li className={styles.buildingListHeader}>
                <span>건물 목록</span>
              </li>

              {selectedBuildings.map((b, idx) => (
                <li key={b.id} className={styles.buildingItem}>
                  <div className={styles.buildingInfo}>
                    <span>{idx + 1}</span>
                    <span>{b.place_name}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => handleRemoveBuilding(b.id)}
                  >
                    <img src="minus.svg" alt="삭제" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            aria-expanded={panelOpen}
            className={styles.toggleBtn}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <span className={styles.blind}>
              {panelOpen ? "패널 접기" : "패널 펼치기"}
            </span>
            {panelOpen ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            ) : (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
