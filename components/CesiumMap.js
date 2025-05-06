import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import * as Cesium from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";

import axios from "../lib/axios";
import styles from "./CesiumMap.module.css";
import ImagePopup from "./ImagePopup";

// Cesium 토큰 설정
Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN;

/**
 * CesiumMap 컴포넌트
 * 3D 지도와 관련 기능을 제공하는 메인 컴포넌트입니다.
 * - 3D 건물 렌더링
 * - 마커 표시
 * - 웨이포인트 관리
 * - 좌표 정보 표시
 */
const CesiumMap = () => {
  // Cesium 뷰어를 위한 ref들
  const cesiumContainer = useRef(null); // Cesium 지도가 렌더링될 컨테이너
  const parentContainer = useRef(null); // 부모 컨테이너 (리사이징용)
  const viewerRef = useRef(null); // Cesium 뷰어 인스턴스

  // 웨이포인트 이미지 팝업 관련 상태
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [popupImages, setPopupImages] = useState([]);
  const [selectedWaypointName, setSelectedWaypointName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 팝업 포털을 위한 useEffect 추가
  useEffect(() => {
    // 팝업이 표시될 때 body의 스크롤 방지
    if (showImagePopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showImagePopup]);

  // 이미지 팝업 닫기 핸들러
  const closeImagePopup = () => {
    setShowImagePopup(false);
    setPopupImages([]);
    setSelectedWaypointName("");
    setSelectedImage(null);
  };

  // 이미지 클릭 핸들러 - 개별 이미지를 더 크게 보기
  const handleImageClick = (image) => {
    console.log("이미지 클릭됨:", image); // 디버깅용 로그 추가

    // 이미지 데이터에서 균열폭 정보 추출 (다양한 프로퍼티명 검사)
    const crackWidth =
      image.crackWidth ||
      image.crack_width ||
      image.width ||
      (image.metadata && image.metadata.crackWidth) ||
      (image.metadata && image.metadata.width) ||
      (image.data && image.data.crackWidth) ||
      (image.data && image.data.width);

    // 선택된 이미지 상태 업데이트 (균열폭 정보 추가)
    setSelectedImage({
      ...image,
      crackWidth: crackWidth, // 균열폭 정보 명시적으로 추가
    });
  };

  // 웨이포인트 이미지 불러오기 함수
  const fetchWaypointImages = async (waypointId, waypointName) => {
    if (!waypointId) {
      console.error("유효하지 않은 웨이포인트 ID:", waypointId);
      return;
    }

    console.log(
      `웨이포인트 이미지 불러오기 시작: ID=${waypointId}, 이름=${waypointName}`
    );
    setLoading(true);

    try {
      // API 호출
      const apiUrl = `/waypoints/${waypointId}/images`;
      console.log("API 요청:", apiUrl);

      const response = await axios.get(apiUrl);
      console.log("API 응답:", response);

      // 응답 데이터 처리
      if (!response.data) {
        console.warn("API 응답에 데이터가 없습니다");
        setPopupImages([]);
        setSelectedWaypointName(waypointName || "웨이포인트");
        setShowImagePopup(true);
        return;
      }

      // 이미지 배열 추출 (API에 따라 구조가 달라질 수 있음)
      let imagesList = [];

      if (response.data.images && Array.isArray(response.data.images)) {
        // {images: [...]} 구조인 경우
        imagesList = response.data.images;
      } else if (Array.isArray(response.data)) {
        // 직접 배열인 경우
        imagesList = response.data;
      } else {
        console.warn("예상치 못한 API 응답 구조:", response.data);
        // 객체 형태일 경우 키-값을 이미지 목록으로 변환 시도
        try {
          imagesList = Object.values(response.data).filter(
            (item) => item && typeof item === "object" && item.imageUrl
          );
        } catch (err) {
          console.error("응답 데이터 변환 실패:", err);
          imagesList = [];
        }
      }

      console.log("추출된 이미지 목록:", imagesList);

      // 유효한 이미지만 필터링
      const validImages = imagesList.filter(
        (img) => img && img.imageUrl && img.timestamp
      );

      if (validImages.length === 0) {
        console.warn("유효한 이미지가 없습니다");
        // 테스트 이미지로 대체 (필요시)
        showTestImagePopup(waypointName);
        return;
      }

      // 이미지 데이터 가공 - 균열폭 정보 추출 및 정규화
      const processedImages = validImages.map((img) => {
        // 다양한 필드에서 균열폭 정보 검색
        const crackWidth =
          img.crackWidth ||
          img.crack_width ||
          img.width ||
          (img.metadata && img.metadata.crackWidth) ||
          (img.metadata && img.metadata.width) ||
          (img.data && img.data.crackWidth) ||
          (img.data && img.data.width);

        // 원본 이미지 데이터에 균열폭 정보 추가
        return {
          ...img,
          crackWidth: crackWidth,
        };
      });

      // 이미지를 날짜별로 그룹화
      const imagesByDate = {};

      processedImages.forEach((image) => {
        // 타임스탬프가 없는 경우 현재 시간 사용
        const timestamp = image.timestamp || new Date().toISOString();
        const date = new Date(timestamp).toLocaleDateString();

        if (!imagesByDate[date]) {
          imagesByDate[date] = [];
        }
        imagesByDate[date].push(image);
      });

      // 이미지 그룹을 배열로 변환하고 날짜별로 정렬
      const groupedImages = Object.keys(imagesByDate)
        .sort((a, b) => new Date(b) - new Date(a)) // 최신 날짜순 정렬
        .map((date) => ({
          date,
          images: imagesByDate[date],
        }));

      console.log("그룹화된 이미지:", groupedImages);

      setPopupImages(groupedImages);
      setSelectedWaypointName(waypointName || "웨이포인트");
      setShowImagePopup(true);
    } catch (error) {
      console.error("웨이포인트 이미지 로딩 실패:", error);

      if (error.response) {
        console.error(
          "API 오류 응답:",
          error.response.status,
          error.response.data
        );
      }

      // API 실패 시 테스트 이미지로 대체
      showTestImagePopup(waypointName);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let viewer;
    let markers = [];
    let resizeObserver;
    let isComponentMounted = true;

    // 이벤트 핸들러 함수들을 useEffect 스코프 내부로 이동
    let handleAddressSelect;
    let handleMarkerRemove;
    let handleDateChange;
    let handleBuildingSelect;

    /**
     * Cesium 초기화 함수
     * 지도, 지형, 3D 타일셋 등을 설정합니다.
     */
    const initializeCesium = async () => {
      try {
        // 이미 뷰어가 존재하면 제거
        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }

        /**
         * 날짜 변경 이벤트 처리 함수
         * 날짜가 변경되면 웨이포인트 선택을 초기화합니다.
         */
        handleDateChange = (event) => {
          // 날짜 변경 시 웨이포인트 선택 초기화 이벤트 발생
          const resetEvent = new CustomEvent("waypointSelect", {
            detail: {
              waypointId: null,
              waypointName: null,
            },
          });
          window.dispatchEvent(resetEvent);
        };

        window.addEventListener("dateChange", handleDateChange);

        // Cesium 뷰어 초기화 및 옵션 설정
        viewer = new Cesium.Viewer(cesiumContainer.current, {
          terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1), // 지형 데이터 설정
          baseLayerPicker: true, // 기본 지도 레이어 선택기 활성화
          geocoder: false, // 지오코더 비활성화
          homeButton: false, // 홈 버튼 비활성화
          animation: false, // 애니메이션 비활성화
          infoBox: false, // 인포박스 비활성화
          sceneModePicker: false, // 씬 모드 선택기 비활성화
          selectionIndicator: false, // 선택 표시기 비활성화
          timeline: false, // 타임라인 비활성화
          navigationHelpButton: false, // 네비게이션 도움말 버튼 비활성화
          fullscreenElement: cesiumContainer.current, // 전체화면 요소 설정
        });

        // 컴포넌트가 언마운트되었으면 뷰어 제거
        if (!isComponentMounted) {
          viewer.destroy();
          return;
        }

        // 지형에 대한 깊이 테스트 활성화 (지형과 객체 간의 정확한 깊이 표현)
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // 웨이포인트 클릭 이벤트 처리 - 코드 위치 이동
        const setupClickHandler = () => {
          if (!viewer) return;

          console.log("웨이포인트 클릭 핸들러 설정 중");

          // 기존 이벤트 핸들러 제거
          viewer.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_CLICK
          );

          // 새 이벤트 핸들러 추가
          viewer.screenSpaceEventHandler.setInputAction((click) => {
            console.log("지도 클릭 감지됨", click.position);

            try {
              // 클릭한 객체 정보 얻기
              const pickedObject = viewer.scene.pick(click.position);
              console.log("클릭한 객체:", pickedObject);

              // 피킹된 객체가 있는 경우
              if (Cesium.defined(pickedObject) && pickedObject.id) {
                const entity = pickedObject.id;
                console.log("클릭한 엔티티:", entity);

                // Entity의 properties를 사용하여 타입 확인
                if (
                  entity.properties &&
                  entity.properties.type &&
                  entity.properties.type._value === "waypoint"
                ) {
                  console.log("웨이포인트 클릭 확인");

                  // 웨이포인트 정보 추출
                  const waypointId =
                    entity.properties.waypointId &&
                    entity.properties.waypointId._value;
                  const waypointData =
                    entity.properties.waypointData &&
                    entity.properties.waypointData._value;
                  const buildingId =
                    entity.properties.buildingId &&
                    entity.properties.buildingId._value;
                  const waypointName =
                    entity.label &&
                    entity.label.text &&
                    entity.label.text._value;

                  console.log("웨이포인트 정보:", {
                    id: waypointId,
                    buildingId: buildingId,
                    name: waypointName,
                  });

                  if (waypointId) {
                    // 웨이포인트 선택 이벤트 발생
                    const waypointEvent = new CustomEvent("waypointSelect", {
                      detail: {
                        waypointId: waypointId,
                        waypointName: waypointName,
                      },
                    });
                    window.dispatchEvent(waypointEvent);

                    // 실제 API 호출을 통해 이미지 불러오기
                    try {
                      fetchWaypointImages(waypointId, waypointName);
                    } catch (e) {
                      console.error("이미지 로딩 중 오류:", e);
                      // 오류 발생 시 테스트 이미지로 대체
                      showTestImagePopup(waypointName);
                    }
                  } else {
                    console.warn("웨이포인트 ID를 찾을 수 없음");
                    showTestImagePopup("웨이포인트");
                  }
                } else if (
                  entity.properties &&
                  entity.properties.type &&
                  entity.properties.type._value === "building"
                ) {
                  console.log("건물 클릭됨");
                  // 건물 클릭 처리 (필요시)
                } else {
                  console.log("알 수 없는 엔티티 유형");
                  // 이제 디버깅용 테스트 팝업을 표시하지 않음
                }
              } else {
                console.log("클릭한 객체를 찾을 수 없음");
              }
            } catch (error) {
              console.error("클릭 이벤트 처리 중 오류:", error);
            }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          console.log("웨이포인트 클릭 핸들러 설정 완료");
        };

        // 테스트 이미지 팝업 표시 함수
        const showTestImagePopup = (waypointName) => {
          console.log("테스트 이미지 팝업 표시:", waypointName);

          // 테스트 이미지 데이터 - 공개 이미지 URL 사용
          const testImages = [
            {
              imageUrl:
                "https://images.unsplash.com/photo-1544069331-6f52d91df101",
              timestamp: new Date(2023, 5, 15, 10, 30).toISOString(),
              crackWidth: 2.5,
            },
            {
              imageUrl:
                "https://images.unsplash.com/photo-1633889608856-086d6964bfb9",
              timestamp: new Date(2023, 5, 15, 14, 45).toISOString(),
              crackWidth: 1.8,
            },
            {
              imageUrl:
                "https://images.unsplash.com/photo-1640132090133-324019f2ff5c",
              timestamp: new Date(2023, 6, 20, 9, 15).toISOString(),
              crackWidth: 3.2,
            },
          ];

          // 이미지를 날짜별로 그룹화
          const imagesByDate = {};
          testImages.forEach((image) => {
            const date = new Date(image.timestamp).toLocaleDateString();
            if (!imagesByDate[date]) {
              imagesByDate[date] = [];
            }
            imagesByDate[date].push(image);
          });

          // 이미지 그룹을 배열로 변환하고 날짜별로 정렬
          const groupedImages = Object.keys(imagesByDate)
            .sort((a, b) => new Date(b) - new Date(a))
            .map((date) => ({
              date,
              images: imagesByDate[date],
            }));

          // 상태 업데이트
          setPopupImages(groupedImages);
          setSelectedWaypointName(waypointName || "웨이포인트");
          setShowImagePopup(true);
          setLoading(false);

          // CSS 스타일 확인
          console.log("팝업 CSS 클래스 확인:", {
            waypointPopupOverlay: styles.waypointPopupOverlay ? "있음" : "없음",
            waypointPopup: styles.waypointPopup ? "있음" : "없음",
            popupHeader: styles.popupHeader ? "있음" : "없음",
            popupContent: styles.popupContent ? "있음" : "없음",
            dateGroup: styles.dateGroup ? "있음" : "없음",
            imagesGrid: styles.imagesGrid ? "있음" : "없음",
          });
        };

        // 3D 타일셋 로드 (건물 모델)
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
        viewer.scene.primitives.add(tileset);
        await viewer.zoomTo(tileset);

        // 건물 데이터를 저장할 변수를 바깥 스코프에 선언
        let buildings = [];

        // 건물 데이터 가져오기
        try {
          console.log("건물 및 웨이포인트 데이터 로딩 시작");
          const response = await axios.get("/buildings");
          console.log("건물 API 응답:", response.data);

          buildings = response.data;
          if (!buildings || buildings.length === 0) {
            console.warn("건물 데이터가 없습니다");
          } else {
            console.log(`${buildings.length}개의 건물 데이터 로딩 완료`);

            // 각 건물과 웨이포인트에 대한 마커 생성
            buildings.forEach((building, buildingIndex) => {
              console.log(
                `건물 처리 중: ${building.name || `건물 ${buildingIndex + 1}`}`
              );

              // 건물 마커 생성 (위치, 아이콘, 라벨 설정)
              if (
                !building.location ||
                !building.location.longitude ||
                !building.location.latitude
              ) {
                console.warn(
                  `건물 ${building.id || buildingIndex} 위치 정보 없음`
                );
                return;
              }

              // 중복 ID 확인 및 제거
              const buildingId = `building-${building.id}`;
              const existingBuilding = viewer.entities.getById(buildingId);
              if (existingBuilding) {
                console.log(
                  `중복된 건물 ID 발견, 기존 객체 제거: ${buildingId}`
                );
                viewer.entities.removeById(buildingId);
              }

              viewer.entities.add({
                id: buildingId,
                position: Cesium.Cartesian3.fromDegrees(
                  building.location.longitude,
                  building.location.latitude,
                  0
                ),
                point: {
                  pixelSize: 10,
                  color: Cesium.Color.BLUE,
                  outlineColor: Cesium.Color.WHITE,
                  outlineWidth: 2,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                label: {
                  text: building.name || `건물 ${buildingIndex + 1}`,
                  font: "14px sans-serif",
                  fillColor: Cesium.Color.WHITE,
                  outlineColor: Cesium.Color.BLACK,
                  outlineWidth: 2,
                  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                  verticalOrigin: Cesium.VerticalOrigin.TOP,
                  pixelOffset: new Cesium.Cartesian2(0, -10),
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
                properties: {
                  type: "building",
                  buildingData: building,
                },
              });

              // 각 웨이포인트 마커 생성 (측정 지점)
              if (
                !building.measurements ||
                building.measurements.length === 0
              ) {
                console.warn(
                  `건물 ${building.id || buildingIndex}에 웨이포인트 없음`
                );
                return;
              }

              console.log(
                `${building.measurements.length}개의 웨이포인트 처리 중`
              );
              building.measurements.forEach((waypoint, index) => {
                if (
                  !waypoint.location ||
                  !waypoint.location.longitude ||
                  !waypoint.location.latitude
                ) {
                  console.warn(
                    `웨이포인트 ${waypoint.id || index} 위치 정보 없음`
                  );
                  return;
                }

                // 고유한 ID 생성을 위해 건물 ID와 웨이포인트 ID 결합
                const uniqueWaypointId = `waypoint-${building.id}-${waypoint.id}-${index}`;
                console.log(`웨이포인트 추가: ${uniqueWaypointId}`);

                // 중복 ID 확인 및 제거
                const existingWaypoint =
                  viewer.entities.getById(uniqueWaypointId);
                if (existingWaypoint) {
                  console.log(
                    `중복된 웨이포인트 ID 발견, 기존 객체 제거: ${uniqueWaypointId}`
                  );
                  viewer.entities.removeById(uniqueWaypointId);
                }

                // 위치 좌표 계산
                const position = Cesium.Cartesian3.fromDegrees(
                  waypoint.location.longitude,
                  waypoint.location.latitude,
                  waypoint.location.altitude || 0
                );

                // 웨이포인트 마커 생성
                const entity = viewer.entities.add({
                  id: uniqueWaypointId,
                  position: position,
                  point: {
                    pixelSize: 15, // 더 큰 포인트 마커
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                  label: {
                    text: waypoint.label || `WP-${waypoint.id || index + 1}`,
                    font: "16px sans-serif",
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                  },
                  properties: {
                    type: "waypoint",
                    buildingId: building.id,
                    waypointId: waypoint.id,
                    waypointData: waypoint,
                  },
                });
              });

              // 웨이포인트 간 점선 연결 (경로 표시)
              if (building.measurements.length > 1) {
                for (let i = 0; i < building.measurements.length - 1; i++) {
                  const start = Cesium.Cartesian3.fromDegrees(
                    building.measurements[i].location.longitude,
                    building.measurements[i].location.latitude,
                    building.measurements[i].location.altitude || 0
                  );
                  const end = Cesium.Cartesian3.fromDegrees(
                    building.measurements[i + 1].location.longitude,
                    building.measurements[i + 1].location.latitude,
                    building.measurements[i + 1].location.altitude || 0
                  );

                  // 점선에 고유 ID 부여
                  const lineId = `line-${building.id}-${i}`;

                  // 중복 ID 확인 및 제거
                  const existingLine = viewer.entities.getById(lineId);
                  if (existingLine) {
                    console.log(
                      `중복된 연결선 ID 발견, 기존 객체 제거: ${lineId}`
                    );
                    viewer.entities.removeById(lineId);
                  }

                  viewer.entities.add({
                    id: lineId,
                    polyline: {
                      positions: [start, end],
                      width: 2,
                      material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.YELLOW,
                        dashLength: 10,
                      }),
                    },
                  });
                }
              }
            });

            // 초기 카메라 위치 설정
            if (buildings.length > 0) {
              // 첫 번째 건물 위치로 설정
              const firstBuilding = buildings[0];
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                  firstBuilding.location.longitude,
                  firstBuilding.location.latitude,
                  300 // 고도 (미터)
                ),
                orientation: {
                  heading: Cesium.Math.toRadians(0.0), // 카메라 회전 각도
                  pitch: Cesium.Math.toRadians(-90.0), // 카메라 상하 각도 (직하방)
                  roll: 0.0, // 카메라 기울기
                },
                duration: 0, // 즉시 이동
              });
            } else {
              // 건물이 없는 경우 기본 위치 (다산정보관 근처)
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                  36.76458140716308,
                  127.28252982310103,
                  3000 // 고도 (미터)
                ),
                orientation: {
                  heading: Cesium.Math.toRadians(0.0), // 카메라 회전 각도
                  pitch: Cesium.Math.toRadians(-90.0), // 카메라 상하 각도 (직하방)
                  roll: 0.0, // 카메라 기울기
                },
                duration: 0, // 즉시 이동
              });
            }

            console.log("모든 웨이포인트 로딩 완료, 클릭 핸들러 설정");
          }

          // 모든 건물 및 웨이포인트 로딩 후 클릭 핸들러 설정
          setupClickHandler();
        } catch (error) {
          console.error("건물 데이터 로딩 중 오류 발생:", error);

          // 오류 발생 시 기본 카메라 위치로 설정
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
              36.76458140716308,
              127.28252982310103,
              3000 // 고도 (미터)
            ),
            orientation: {
              heading: Cesium.Math.toRadians(0.0),
              pitch: Cesium.Math.toRadians(-90.0),
              roll: 0.0,
            },
            duration: 0,
          });

          // 오류가 발생해도 클릭 핸들러는 설정
          setupClickHandler();
        }

        viewerRef.current = viewer;

        /**
         * 리사이즈 감지 및 처리
         * 부모 컨테이너 크기 변경 시 Cesium 뷰어 크기도 자동 조정
         */
        resizeObserver = new ResizeObserver(() => {
          if (viewer && parentContainer.current) {
            const { width, height } =
              parentContainer.current.getBoundingClientRect();
            cesiumContainer.current.style.width = `${width}px`;
            cesiumContainer.current.style.height = `${height}px`;
            viewer.resize();
          }
        });

        if (parentContainer.current) {
          resizeObserver.observe(parentContainer.current);
        }

        /**
         * 주소 선택 이벤트 처리 함수
         * 검색된 주소로 카메라 이동 및 마커 표시
         */
        handleAddressSelect = (event) => {
          try {
            const place = event.detail;
            if (!viewerRef.current) {
              console.warn("Viewer가 아직 초기화되지 않았습니다.");
              return;
            }

            if (!place || !place.x || !place.y) {
              console.warn("잘못된 위치 데이터입니다:", place);
              return;
            }

            // 이전 마커 제거
            markers.forEach((markerId) => {
              viewerRef.current.entities.removeById(markerId);
            });
            markers = [];

            // 위치로 카메라 이동
            viewerRef.current.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                parseFloat(place.x),
                parseFloat(place.y),
                500
              ),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-90),
                roll: 0,
              },
              duration: 2,
            });

            // 선택된 위치에 마커 추가
            const markerId = `marker-${Date.now()}`;
            const entity = viewerRef.current.entities.add({
              id: markerId,
              position: Cesium.Cartesian3.fromDegrees(
                parseFloat(place.x),
                parseFloat(place.y),
                10
              ),
              point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
              label: {
                text: place.address,
                font: "14px sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, -10),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
            });

            markers.push(markerId);
            viewerRef.current.selectedEntity = entity;

            // 마커 추가 이벤트 발생
            const markerEvent = new CustomEvent("markerAdd", {
              detail: {
                id: markerId,
                address: place.address,
                x: place.x,
                y: place.y,
              },
            });
            window.dispatchEvent(markerEvent);
          } catch (error) {
            console.error("주소 선택 처리 중 오류 발생:", error);
          }
        };

        /**
         * 마커 제거 이벤트 처리 함수
         * 저장된 마커를 지도에서 제거
         */
        handleMarkerRemove = (event) => {
          try {
            const markerId = event.detail.id;
            if (!viewerRef.current) {
              console.warn("Viewer가 아직 초기화되지 않았습니다.");
              return;
            }

            viewerRef.current.entities.removeById(markerId);
            markers = markers.filter((id) => id !== markerId);
          } catch (error) {
            console.error("마커 제거 중 오류 발생:", error);
          }
        };

        // 이벤트 리스너 등록
        window.addEventListener("addressSelect", handleAddressSelect);
        window.addEventListener("markerRemove", handleMarkerRemove);

        /**
         * 건물 선택 이벤트 처리 함수
         * 선택된 건물로 카메라 이동 및 마커 표시
         */
        handleBuildingSelect = (event) => {
          try {
            const building = event.detail;
            if (!viewerRef.current) {
              console.warn("Viewer가 아직 초기화되지 않았습니다.");
              return;
            }

            if (!building || !building.location) {
              console.warn("잘못된 건물 데이터입니다:", building);
              return;
            }

            // 선택된 건물 위치로 카메라 이동
            viewerRef.current.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                building.location.longitude,
                building.location.latitude,
                300 // 고도 (미터)
              ),
              orientation: {
                heading: Cesium.Math.toRadians(0.0), // 카메라 회전 각도
                pitch: Cesium.Math.toRadians(-90.0), // 카메라 상하 각도 (직하방)
                roll: 0.0, // 카메라 기울기
              },
              duration: 1, // 1초 동안 부드럽게 이동
            });

            // 선택된 건물에 마커 추가 (이미 있는 경우 제거)
            const markerId = `building-marker-${building.id}`;

            // 이전 마커 제거
            const existingMarker = viewerRef.current.entities.getById(markerId);
            if (existingMarker) {
              viewerRef.current.entities.removeById(markerId);
            }

            // 새 마커 추가
            const entity = viewerRef.current.entities.add({
              id: markerId,
              position: Cesium.Cartesian3.fromDegrees(
                building.location.longitude,
                building.location.latitude,
                10
              ),
              point: {
                pixelSize: 10,
                color: Cesium.Color.BLUE,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
              label: {
                text: building.name,
                font: "14px sans-serif",
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, -10),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
            });

            viewerRef.current.selectedEntity = entity;
          } catch (error) {
            console.error("건물 선택 처리 중 오류 발생:", error);
          }
        };

        // 건물 선택 이벤트 리스너 등록
        window.addEventListener("buildingSelect", handleBuildingSelect);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
          window.removeEventListener("addressSelect", handleAddressSelect);
          window.removeEventListener("markerRemove", handleMarkerRemove);
          window.removeEventListener("dateChange", handleDateChange);
          window.removeEventListener("buildingSelect", handleBuildingSelect);
          if (resizeObserver) {
            resizeObserver.disconnect();
          }
        };
      } catch (error) {
        console.error("Cesium 초기화 중 오류 발생:", error);
      }
    };

    // Cesium 초기화 함수 호출
    initializeCesium();

    // 컴포넌트 언마운트 시 Cesium 뷰어 정리
    return () => {
      isComponentMounted = false;

      // 이벤트 리스너 제거 (함수가 정의된 경우에만)
      if (handleAddressSelect) {
        window.removeEventListener("addressSelect", handleAddressSelect);
      }
      if (handleMarkerRemove) {
        window.removeEventListener("markerRemove", handleMarkerRemove);
      }
      if (handleDateChange) {
        window.removeEventListener("dateChange", handleDateChange);
      }
      if (handleBuildingSelect) {
        window.removeEventListener("buildingSelect", handleBuildingSelect);
      }

      // 리사이즈 옵저버 제거
      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      // Cesium 뷰어 제거
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // 컴포넌트 렌더링
  return (
    <div
      ref={parentContainer}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={cesiumContainer}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* 개별 이미지 팝업 */}
      {selectedImage && (
        <ImagePopup
          imageUrl={selectedImage.imageUrl}
          description={selectedWaypointName}
          metadata={{
            date: new Date(selectedImage.timestamp).toLocaleString(),
            width: selectedImage.crackWidth
              ? `${selectedImage.crackWidth}mm`
              : "정보 없음",
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* 웨이포인트 이미지 팝업 - Portal 사용 */}
      {showImagePopup &&
        ReactDOM.createPortal(
          <div
            className={styles.waypointPopupOverlay}
            onClick={closeImagePopup}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              pointerEvents: "all",
            }}
          >
            <div
              className={styles.waypointPopup}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "800px",
                width: "90%",
                maxHeight: "90vh",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                position: "relative",
                zIndex: 10000,
              }}
            >
              {/* 팝업 헤더 */}
              <div className={styles.popupHeader}>
                <h3>{selectedWaypointName} 이미지</h3>
                <button
                  className={styles.closeButton}
                  onClick={closeImagePopup}
                >
                  ✕
                </button>
              </div>

              {/* 팝업 내용 */}
              <div
                className={styles.popupContent}
                style={{
                  padding: "1.5rem",
                  overflowY: "auto",
                  flex: 1,
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
                }}
              >
                {loading ? (
                  <div className={styles.loading}>이미지 로딩 중...</div>
                ) : popupImages.length === 0 ? (
                  <div className={styles.noData}>이미지가 없습니다.</div>
                ) : (
                  <div
                    className={styles.imagesByDate}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2rem",
                      paddingRight: "0.5rem",
                    }}
                  >
                    {popupImages.map((group, groupIndex) => (
                      <div key={groupIndex} className={styles.dateGroup}>
                        <h4 className={styles.dateHeader}>{group.date}</h4>
                        <div className={styles.imagesGrid}>
                          {group.images.map((image, index) => (
                            <div key={index} className={styles.imageWrapper}>
                              <img
                                src={image.imageUrl}
                                alt={`${selectedWaypointName} 이미지 ${
                                  index + 1
                                }`}
                                className={styles.image}
                                onClick={() => handleImageClick(image)}
                              />
                              <div className={styles.imageTime}>
                                {new Date(image.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CesiumMap;
