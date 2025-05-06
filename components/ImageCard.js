"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./ImageCard.module.css";
import ImagePopup from "./ImagePopup";
import { useBuilding } from "../contexts/BuildingContext";
import axios from "../lib/axios";

export default function ImageCard({ images: propImages }) {
  const scrollContainerRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imagesPerRow, setImagesPerRow] = useState(2);
  const [selectedImage, setSelectedImage] = useState(null);
  const [buildingImages, setBuildingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { selectedBuilding } = useBuilding();

  // 이미지 URL 검증 함수
  const validateImageUrl = (url) => {
    if (!url) return null;

    // URL이 이미 절대 경로인 경우 그대로 반환
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // 상대 경로인 경우 슬래시로 시작하는지 확인하고 수정
    if (!url.startsWith("/")) {
      return `/${url}`;
    }

    return url;
  };

  // 선택된 건물이 변경될 때마다 해당 건물의 웨이포인트별 최신 이미지를 가져옴
  useEffect(() => {
    const fetchBuildingImages = async () => {
      if (!selectedBuilding?.id) {
        setBuildingImages([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          "API 요청 시작:",
          `waypoints?buildingId=${selectedBuilding.id}`
        );

        const response = await axios.get(
          `waypoints?buildingId=${selectedBuilding.id}`
        );

        console.log("API 응답 데이터:", response.data);

        if (response.data && response.data.waypoints) {
          const filteredImages = response.data.waypoints
            .filter((wp) => wp.imageUrl)
            .map((wp) => ({
              ...wp,
              imageUrl: validateImageUrl(wp.imageUrl),
            }));

          console.log("필터링된 이미지 목록:", filteredImages);

          // 이미지 URL 로깅
          filteredImages.forEach((img, idx) => {
            console.log(`이미지 ${idx + 1} URL:`, img.imageUrl);
          });

          setBuildingImages(filteredImages);
        } else {
          console.log("API 응답에 waypoints 데이터가 없습니다:", response.data);
          setBuildingImages([]);
        }
      } catch (err) {
        console.error("이미지 데이터 로딩 실패:", err);
        console.error("오류 상세 정보:", err.response?.data || err.message);
        setError(`이미지를 불러오는데 실패했습니다: ${err.message}`);
        setBuildingImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildingImages();
  }, [selectedBuilding]);

  // 최종적으로 표시할 이미지 배열
  const displayImages =
    propImages ||
    (buildingImages && buildingImages.length > 0
      ? buildingImages.map((wp) => {
          console.log("이미지 매핑:", wp);
          return {
            url: validateImageUrl(wp.imageUrl),
            label: wp.label,
            date: wp.date,
            width_mm: wp.width_mm,
          };
        })
      : []);

  // 컨테이너 크기 변경 감지
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const updateContainerSize = () => {
      if (scrollContainerRef.current) {
        const { offsetWidth, offsetHeight } = scrollContainerRef.current;
        setContainerSize({ width: offsetWidth, height: offsetHeight });

        // 컨테이너 너비에 따라 이미지 개수 조정
        const width = offsetWidth;
        // 이미지 너비(240) + 갭(16) 고려하여 계산
        const calcImagesPerRow = Math.max(1, Math.floor(width / 260));
        setImagesPerRow(calcImagesPerRow);
      }
    };

    // 초기 크기 설정
    updateContainerSize();

    // 리사이즈 이벤트 감지
    const resizeObserver = new ResizeObserver(updateContainerSize);
    resizeObserver.observe(scrollContainerRef.current);

    return () => {
      if (scrollContainerRef.current) {
        resizeObserver.unobserve(scrollContainerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setScrollLeft(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth);
    }
  };

  const handleScrollbarChange = (e) => {
    if (scrollContainerRef.current) {
      const newScrollLeft = Number.parseInt(e.target.value);
      scrollContainerRef.current.scrollLeft = newScrollLeft;
      setScrollLeft(newScrollLeft);
    }
  };

  // 이미지 클릭 핸들러
  const handleImageClick = (image, index) => {
    const imageUrl =
      typeof image === "string"
        ? image
        : validateImageUrl(image.url || image.imageUrl);
    console.log("선택된 이미지 URL:", imageUrl);

    setSelectedImage({
      imageUrl: imageUrl,
      index: index,
      label: image.label,
      date: image.date,
      width_mm: image.width_mm,
    });
  };

  // 팝업 닫기 핸들러
  const closePopup = () => {
    setSelectedImage(null);
  };

  // 이미지를 행별로 분할하는 함수
  const renderImageRows = () => {
    if (!imagesPerRow) return null;

    if (loading) {
      return (
        <div className={styles.loading}>
          <p>균열 이미지 로딩 중...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      );
    }

    if (!selectedBuilding) {
      return (
        <div className={styles.placeholder}>
          <p>건물을 선택하면 균열 이미지가 표시됩니다</p>
        </div>
      );
    }

    console.log("렌더링할 이미지 목록:", displayImages);

    if (!displayImages || displayImages.length === 0) {
      return (
        <div className={styles.placeholder}>
          <p>{selectedBuilding.name}의 이미지 데이터가 없습니다</p>
        </div>
      );
    }

    // 이미지를 행으로 나누기
    const rows = [];
    for (let i = 0; i < displayImages.length; i += imagesPerRow) {
      const rowImages = displayImages.slice(i, i + imagesPerRow);
      rows.push(
        <div key={`row-${i}`} className={styles.row}>
          {rowImages.map((image, index) => {
            const imageUrl =
              typeof image === "string"
                ? validateImageUrl(image)
                : validateImageUrl(image.url || image.imageUrl);

            console.log(`이미지 렌더링 ${i + index}:`, imageUrl);

            // 이미지 URL이 null이면 렌더링하지 않음
            if (!imageUrl) return null;

            return (
              <div
                key={`img-${i + index}`}
                className={styles.imageWrapper}
                onClick={() => handleImageClick(image, i + index)}
              >
                <img
                  src={imageUrl}
                  alt={`균열 이미지 ${i + index + 1}`}
                  className={styles.image}
                  onError={(e) => {
                    console.error(`이미지 로드 실패: ${imageUrl}`);
                    e.target.src = "/placeholder.svg";
                  }}
                />
                {(image.label || image.date) && (
                  <div className={styles.imageInfo}>
                    {image.label && (
                      <span className={styles.waypointLabel}>
                        {image.label}
                      </span>
                    )}
                    {image.date && (
                      <span className={styles.timestamp}>{image.date}</span>
                    )}
                    {image.width_mm && (
                      <span className={styles.width}>{image.width_mm}mm</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>균열 이미지</h2>
        {selectedBuilding && (
          <span className={styles.subtitle}>{selectedBuilding.name}</span>
        )}
      </div>
      <div
        ref={scrollContainerRef}
        className={styles.imageContainer}
        onScroll={handleScroll}
      >
        <div className={styles.imageGrid}>{renderImageRows()}</div>
      </div>
      {maxScroll > 0 && (
        <div className={styles.scrollbarContainer}>
          <input
            type="range"
            min="0"
            max={maxScroll || 100}
            value={scrollLeft}
            onChange={handleScrollbarChange}
            className={styles.scrollbar}
          />
        </div>
      )}

      {/* 이미지 팝업 */}
      {selectedImage && (
        <ImagePopup
          imageUrl={selectedImage.imageUrl}
          description={
            selectedImage.label || `균열 이미지 ${selectedImage.index + 1}`
          }
          onClose={closePopup}
          metadata={{
            date: selectedImage.date,
            width: selectedImage.width_mm
              ? `${selectedImage.width_mm}mm`
              : null,
          }}
        />
      )}
    </div>
  );
}
