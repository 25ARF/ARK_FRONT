import { useEffect, useState } from "react";

/**
 * VWorldMap 컴포넌트
 * 브이월드 API를 활용한 3D 지도 컴포넌트입니다.
 * - 3D 건물 레이어 관리
 * - 카메라 위치 설정
 * - 마커 표시 기능
 */
const VWorldMap = () => {
  // 맵 인스턴스 상태 관리
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    // 브이월드 맵 초기화 옵션 설정
    var options = {
      mapId: "vmap", // 맵 컨테이너 ID
      initPosition: new vw.CameraPosition( // 초기 카메라 위치
        new vw.CoordZ(127.2818, 36.7646, 100000000), // 경도, 위도, 고도
        new vw.Direction(0, -90, 0) // 방향 설정
      ),
      logo: false, // 로고 표시 여부
      navigation: false, // 네비게이션 컨트롤 표시 여부
    };

    // 브이월드 맵 인스턴스 생성 및 시작
    var map = new vw.Map();
    map.setOption(options);
    map.start();
    setMapInstance(map);
  }, []);

  /**
   * 건물 아이콘 이미지 생성 함수
   * Canvas API를 사용해 동적으로 건물 모양의 아이콘 생성
   * @returns {HTMLCanvasElement} 건물 아이콘이 그려진 캔버스
   */
  const generateBuildingImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    // 건물 아이콘 그리기 (집 모양)
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.moveTo(16, 0); // 지붕 꼭대기
    ctx.lineTo(32, 16); // 오른쪽 처마
    ctx.lineTo(24, 16); // 오른쪽 벽 상단
    ctx.lineTo(24, 32); // 오른쪽 벽 하단
    ctx.lineTo(8, 32); // 바닥 왼쪽
    ctx.lineTo(8, 16); // 왼쪽 벽 상단
    ctx.lineTo(0, 16); // 왼쪽 처마
    ctx.closePath();
    ctx.fill();

    return canvas;
  };

  /**
   * 레이어 제어 핸들러
   * 건물 레이어 표시/숨김 및 스타일 변경
   */
  const handleLayerControl = () => {
    if (!mapInstance) return;

    // LOD 0 건물 레이어 숨기기
    mapInstance.getElementById("facility_build").hide();

    // LOD 1 건물 레이어 스타일 설정 및 표시
    mapInstance.getElementById("facility_build_lod1").setStyle({
      color: {
        conditions: [["true", "rgba(185,185,185,1)"]], // 회색 건물로 표시
      },
    });
    mapInstance.getElementById("facility_build_lod1").show();

    // 특정 위치(다산정보관)에 마커 추가
    ws3d.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(128.393539, 36.145014, 50), // 경도, 위도, 고도
      billboard: {
        image: generateBuildingImage(),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scale: 0.5,
      },
      label: {
        text: "rnr",
        font: "14px sans-serif",
        fillColor: Cesium.Color.WHITE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });

    // 카메라 위치 설정 (다산정보관 근처로 이동)
    ws3d.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        128.393539, // 다산정보관 경도
        36.145014, // 다산정보관 위도
        300 // 고도 (미터)
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0.0), // 카메라 회전 각도
        pitch: Cesium.Math.toRadians(-45.0), // 카메라 상하 각도
        roll: 0.0, // 카메라 기울기
      },
      duration: 0, // 즉시 이동
    });
  };

  // 컴포넌트 렌더링
  return (
    <div>
      {/* 브이월드 맵 컨테이너 */}
      <div id="vmap" style={{ width: "100%", height: "500px" }}></div>

      {/* 건물 레이어 제어 버튼 */}
      <button
        onClick={handleLayerControl}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        건물 레이어 숨기기
      </button>
    </div>
  );
};

export default VWorldMap;
