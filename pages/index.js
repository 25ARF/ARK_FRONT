// pages/index.js
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import styles from "./index.module.css";
import BuildingListCard from "../components/BuildingListCard";
import MapCard from "../components/MapCard";
import BuildingCrackCountCard from "../components/BuildingCrackCountCard";
import GraphCard from "../components/GraphCard";
import RiskRankingCard from "../components/RiskRankingCard";
import CrackStatsCard from "../components/CrackStatsCard";

/**
 * 대시보드 페이지 컴포넌트
 *
 * 애플리케이션의 메인 대시보드 페이지입니다.
 * 모든 레이아웃과 카드 컴포넌트를 포함합니다.
 */
export default function Dashboard() {
  // 상태 관리
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // 모바일 화면 여부 확인 함수
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
      // 모바일 화면에서는 사이드바를 기본적으로 닫음
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // 초기 실행 및 리사이즈 이벤트 리스너 등록
    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => {
      window.removeEventListener("resize", checkMobileView);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDateClick = (date) => {
    setSelectedDate(new Date(date));
    const event = new CustomEvent("dateChange", { detail: date });
    window.dispatchEvent(event);
  };

  return (
    <>
      <Head>
        <title>RiskFinder</title>
        <meta name="description" content="건축물 균열 탐지 시스템" />
        <link rel="icon" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className={styles.container}>
        {/* 모바일 화면에서 토글 버튼 표시 여부에 따라 사이드바 표시 */}
        {(!isMobileView || (isMobileView && isSidebarOpen)) && <Sidebar />}
        <div className={styles.contentContainer}>
          <Header onToggleSidebar={toggleSidebar} isMobileView={isMobileView} />
          <main className={styles.main}>
            <div className={styles.dashboardGrid}>
              <div className={styles.row1}>
                <div className={styles.gridItem}>
                  <BuildingListCard height="100%" />
                </div>
                <div className={styles.gridItem}>
                  <MapCard />
                </div>
                <div className={styles.gridItem}>
                  <BuildingCrackCountCard />
                </div>
              </div>
              <div className={styles.row2}>
                <div className={styles.gridItem}>
                  <GraphCard />
                </div>
                <div className={styles.gridItem}>
                  <RiskRankingCard />
                </div>
                <div className={styles.gridItem}>
                  <CrackStatsCard />
                </div>
              </div>
            </div>
            <div className={styles.disclaimerText}>
              <img
                src="/warning.svg"
                alt="경고"
                className={styles.warningIcon}
              />
              본 정보는 판단을 돕기 위한 참고용으로 제공되며, 실제 점검 또는
              조치는 전문가의 판단에 따라 수행되어야 합니다.
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
