import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./BuildingListCard.module.css";
import axios from "../lib/axios";
import { useBuilding } from "../contexts/BuildingContext";
import { useRouter } from "next/router";

/**
 * BuildingListCard 컴포넌트
 * 등록된 건물 목록을 표시하고 선택/삭제할 수 있는 카드 컴포넌트입니다.
 * BuildingContext를 사용하여 선택된 건물 정보를 전역 상태로 관리합니다.
 * @param {Object} props - 컴포넌트 프롭스
 * @param {string} props.height - 카드의 높이 (CSS 단위 포함, 예: '20rem', '400px')
 * @param {string} props.className - 추가 CSS 클래스명
 */
const BuildingListCard = ({ height, className }) => {
  // 상태 관리
  const [buildings, setBuildings] = useState([]); // 건물 목록 데이터
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 오류 상태
  const { selectedBuilding, setSelectedBuilding } = useBuilding(); // 전역 건물 선택 상태
  const [deleteConfirm, setDeleteConfirm] = useState(null); // 삭제 확인 모달 상태 (삭제할 건물 ID)
  const [portalElement, setPortalElement] = useState(null); // React Portal 사용을 위한 DOM 요소
  const router = useRouter(); // Next.js 라우터

  // 현재 경로가 인덱스 페이지인지 확인
  const isIndexPage = router.pathname === "/";

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    fetchBuildings(); // 건물 목록 데이터 가져오기

    /**
     * 주소 선택 이벤트 핸들러
     * 새 건물이 추가되면 건물 목록을 다시 불러옵니다.
     */
    const handleAddressSelect = () => {
      fetchBuildings();
    };

    // 이벤트 리스너 등록
    window.addEventListener("addressSelect", handleAddressSelect);

    // Portal 엘리먼트 설정 (모달 렌더링용)
    setPortalElement(document.body);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("addressSelect", handleAddressSelect);
    };
  }, []);

  /**
   * 건물 목록 데이터 가져오기 함수
   * API를 통해 등록된 모든 건물 정보를 가져옵니다.
   */
  const fetchBuildings = async () => {
    try {
      const response = await axios.get("/buildings");
      setBuildings(response.data);

      // 첫 번째 건물을 기본 선택 (선택된 건물이 없을 때)
      if (response.data.length > 0 && !selectedBuilding) {
        setSelectedBuilding(response.data[0]);
      }
    } catch (error) {
      console.error("건물 데이터 로딩 실패:", error);
      setError("건물 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 건물 선택 핸들러
   * 목록에서 건물을 클릭했을 때 해당 건물을 선택 상태로 설정합니다.
   * @param {Object} building - 선택한 건물 객체
   */
  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);

    // 선택된 건물 위치로 맵 이동을 위한 이벤트 발생
    if (building && building.location) {
      console.log("건물 선택 이벤트 발생:", building);
      const event = new CustomEvent("buildingSelect", {
        detail: building,
      });
      window.dispatchEvent(event);
    }
  };

  /**
   * 건물 삭제 버튼 클릭 핸들러
   * 삭제 확인 모달을 표시합니다.
   * @param {string} id - 삭제할 건물 ID
   * @param {Event} e - 이벤트 객체
   */
  const handleRemove = async (id, e) => {
    e.stopPropagation(); // 이벤트 버블링 방지 (건물 선택 방지)
    setDeleteConfirm(id); // 삭제 확인 모달 활성화
  };

  /**
   * 건물 삭제 확인 핸들러
   * 사용자가 모달에서 삭제를 확인하면 실제 삭제 작업을 수행합니다.
   * @param {string} id - 삭제할 건물 ID
   */
  const confirmDelete = async (id) => {
    try {
      // API 호출로 건물 삭제
      await axios.delete(`/buildings/${id}`);

      // 상태에서 해당 건물 제거
      setBuildings(buildings.filter((building) => building.id !== id));

      // 삭제된 건물이 선택된 건물이었다면 선택 해제
      if (selectedBuilding && selectedBuilding.id === id) {
        setSelectedBuilding(null);
      }
    } catch (error) {
      console.error("건물 삭제 실패:", error);
      setError("건물 삭제에 실패했습니다.");
    } finally {
      setDeleteConfirm(null); // 모달 닫기
    }
  };

  /**
   * 건물 삭제 취소 핸들러
   * 삭제 확인 모달을 닫습니다.
   */
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <div
        className={`${styles.card} ${className || ""}`}
        style={height ? { height } : {}}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>건물 목록</h2>
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    );
  }

  // 오류 발생 시 표시할 내용
  if (error) {
    return (
      <div
        className={`${styles.card} ${className || ""}`}
        style={height ? { height } : {}}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>건물 목록</h2>
        </div>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // 메인 컴포넌트 렌더링
  return (
    <div
      className={`${styles.card} ${className || ""}`}
      style={height ? { height } : {}}
    >
      {/* 카드 헤더 */}
      <div className={styles.header}>
        <h2 className={styles.title}>건물 목록</h2>
      </div>
      <div className={styles.resultsHeader}>주소</div>
      {/* 건물 목록 */}
      <div className={styles.list}>
        {buildings.length === 0 ? (
          // 건물이 없을 때 표시할 메시지
          <div className={styles.emptyMessage}>등록된 건물이 없습니다.</div>
        ) : (
          // 건물 목록 렌더링
          buildings.map((building) => (
            <div
              key={building.id}
              className={`${styles.buildingItem} ${
                selectedBuilding?.id === building.id ? styles.selected : ""
              }`}
              onClick={() => handleBuildingSelect(building)}
            >
              {/* 건물 정보 표시 */}
              <div className={styles.buildingInfo}>
                <div className={styles.buildingName}>{building.name}</div>
                <div className={styles.buildingAddress}>{building.address}</div>
              </div>

              {/* 삭제 버튼 - 인덱스 페이지가 아닐 때만 표시 */}
              {!isIndexPage && (
                <button
                  className={styles.removeButton}
                  onClick={(e) => handleRemove(building.id, e)}
                >
                  삭제
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 모달 (React Portal 사용) */}
      {deleteConfirm &&
        portalElement &&
        ReactDOM.createPortal(
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>건물 삭제</h3>
              <p>정말로 이 건물을 삭제하시겠습니까?</p>
              <div className={styles.modalButtons}>
                <button
                  className={`${styles.modalButton} ${styles.confirmButton}`}
                  onClick={() => confirmDelete(deleteConfirm)}
                >
                  삭제
                </button>
                <button
                  className={`${styles.modalButton} ${styles.cancelButton}`}
                  onClick={cancelDelete}
                >
                  취소
                </button>
              </div>
            </div>
          </div>,
          portalElement
        )}
    </div>
  );
};

export default BuildingListCard;
