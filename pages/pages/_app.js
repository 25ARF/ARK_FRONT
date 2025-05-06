// pages/_app.js
import { useRouter } from "next/router";
import { useEffect } from "react";
import NProgress from "nprogress";
import "../styles/globals.css";
import "cesium/Build/Cesium/Widgets/widgets.css"; // Cesium 기본 위젯 스타일
import "nprogress/nprogress.css";
import { BuildingProvider } from "../contexts/BuildingContext";

// NProgress 설정 (페이지 전환 시 상단에 표시되는 로딩 인디케이터)
NProgress.configure({ showSpinner: false });

/**
 * MyApp 컴포넌트
 * 전체 애플리케이션의 진입점이 되는 커스텀 App 컴포넌트입니다.
 * 모든 페이지에 공통적으로 적용되는 레이아웃과 상태를 관리합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {React.Component} props.Component - 현재 렌더링될 페이지 컴포넌트
 * @param {Object} props.pageProps - 페이지 컴포넌트에 전달될 props
 */
function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // 페이지 전환 이벤트 핸들러 등록
  useEffect(() => {
    /**
     * 페이지 전환 시작 시 호출되는 핸들러
     * 로딩 인디케이터를 시작합니다.
     */
    const handleStart = () => {
      NProgress.start();
    };

    /**
     * 페이지 전환 완료 시 호출되는 핸들러
     * 로딩 인디케이터를 종료합니다.
     */
    const handleComplete = () => {
      NProgress.done();
    };

    // 라우터 이벤트 리스너 등록
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete); // 오류 발생 시에도 인디케이터 종료

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // BuildingProvider로 애플리케이션 전체를 감싸 건물 데이터 컨텍스트 제공
  return (
    <BuildingProvider>
      <Component {...pageProps} />
    </BuildingProvider>
  );
}

export default MyApp;
