// components/ImagePopup.js
import React from "react";
import ReactDOM from "react-dom";
import styles from "./ImagePopup.module.css"; // 팝업 스타일을 위한 CSS 모듈

/**
 * ImagePopup 컴포넌트
 * 이미지를 팝업 형태로 크게 표시하는 모달 컴포넌트입니다.
 * 이미지 클릭 시 원본 크기로 볼 수 있게 해줍니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {string} props.imageUrl - 표시할 이미지 URL
 * @param {string|null} props.description - 이미지 설명 텍스트
 * @param {Function} props.onClose - 팝업 닫기 함수
 * @param {Object} props.metadata - 이미지 관련 추가 정보
 */
const ImagePopup = ({ imageUrl, description, onClose, metadata }) => {
  // Portal을 사용하여 document.body에 직접 렌더링
  return ReactDOM.createPortal(
    <div
      className={styles.popupOverlay}
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        pointerEvents: "all",
      }}
    >
      <div
        className={styles.popupContent}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          zIndex: 10000,
        }}
      >
        {/* 닫기 버튼 */}
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>

        {/* 이미지 컨테이너 */}
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt="균열 사진" />
        </div>

        {/* 이미지 설명 (있는 경우만 표시) */}
        <div className={styles.infoContainer}>
          {description && (
            <div className={styles.descriptionContainer}>
              <h3>{description}</h3>
            </div>
          )}

          {/* 메타데이터 표시 영역 */}
          {metadata && (
            <div className={styles.metadataContainer}>
              {metadata.date && (
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>측정일:</span>
                  <span className={styles.metadataValue}>{metadata.date}</span>
                </div>
              )}
              {metadata.width && (
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>균열폭:</span>
                  <span className={styles.metadataValue}>{metadata.width}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImagePopup;
