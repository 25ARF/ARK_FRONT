import React, { useEffect, useRef } from "react";

export default function KakaoMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    // 카카오 지도 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // 스크립트가 로드된 후 지도 생성
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청 좌표
          level: 3,
        };
        new window.kakao.maps.Map(container, options);
      });
    };

    // cleanup: 스크립트 중복 방지
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "120px",
        borderRadius: "8px",
        background: "#f0f0f0",
      }}
    />
  );
}
