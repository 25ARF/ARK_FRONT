import React, { useEffect, useRef } from "react";

import * as Cesium from "cesium";

import "cesium/Build/Cesium/Widgets/widgets.css";

import axios from "../lib/axios";

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

        // 3D 타일셋 로드 (건물 모델)
        const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(96188);
        viewer.scene.primitives.add(tileset);
        await viewer.zoomTo(tileset);

        // 건물 데이터 가져오기
        const response = await axios.get("/buildings");
        const buildings = response.data;

        // 각 건물과 웨이포인트에 대한 마커 생성
        buildings.forEach((building) => {
          // 건물 마커 생성 (위치, 아이콘, 라벨 설정)
          viewer.entities.add({
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

          // 각 웨이포인트 마커 생성 (측정 지점)
          building.measurements.forEach((waypoint, index) => {
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(
                waypoint.location.longitude,
                waypoint.location.latitude,
                waypoint.location.altitude
              ),
              point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
              label: {
                text: waypoint.label,
                font: "14px sans-serif",
                fillColor: Cesium.Color.WHITE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
              },
              waypointData: waypoint, // 사용자 정의 데이터 저장
            });
          });

          // 웨이포인트 간 점선 연결 (경로 표시)
          for (let i = 0; i < building.measurements.length - 1; i++) {
            const start = Cesium.Cartesian3.fromDegrees(
              building.measurements[i].location.longitude,
              building.measurements[i].location.latitude,
              building.measurements[i].location.altitude
            );
            const end = Cesium.Cartesian3.fromDegrees(
              building.measurements[i + 1].location.longitude,
              building.measurements[i + 1].location.latitude,
              building.measurements[i + 1].location.altitude
            );

            viewer.entities.add({
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
    </div>
  );
};

export default CesiumMap;
