import React from "react";
import styles from "./AddressSearchResults.module.css";

const AddressSearchResults = ({
  searchResults = [],
  isLoading,
  error,
  onAddressSelect = () => {},
  onAddBuilding = () => {},
  selectedBuildings = [],
}) => {
  const isSelected = (placeId) =>
    selectedBuildings.some((b) => b.id === placeId);

  const renderContent = () => {
    if (isLoading) return <div className={styles.message}>검색 중...</div>;
    if (error) return <div className={styles.message}>{error}</div>;

    return (
      <div className={styles.resultsList}>
        {searchResults.map((place) => {
          const selected = isSelected(place.id);
          return (
            <div key={place.id} className={styles.resultItem}>
              <div
                className={styles.resultInfo}
                onClick={() => onAddressSelect(place)}
              >
                <div className={styles.placeName}>{place.place_name}</div>
                <div className={styles.addressName}>{place.address_name}</div>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => onAddBuilding(place)}
                disabled={selected}
                title={selected ? "이미 추가됨" : "건물 목록에 추가"}
              >
                <img
                  src={selected ? "check.svg" : "plus.svg"}
                  alt={selected ? "추가됨" : "추가"}
                />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return <div className={styles.resultsContainer}>{renderContent()}</div>;
};

export default AddressSearchResults;
