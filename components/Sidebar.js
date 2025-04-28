// components/Sidebar.js
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Sidebar.module.css";

/**
 * Sidebar 컴포넌트
 * 애플리케이션의 좌측에 표시되는 내비게이션 사이드바입니다.
 * 주요 페이지로의 링크와 아이콘을 제공합니다.
 */
export default function Sidebar() {
  // 현재 라우트 정보 가져오기
  const router = useRouter();

  return (
    <div className={styles.sidebar}>
      {/* 대시보드 페이지 링크 */}
      <div
        className={`${styles.logo} ${
          router.pathname === "/" ? styles.active : ""
        }`}
      >
        <Link href="/">
          <img src={"/logo.svg"} alt="대시보드" title="대시보드" />
        </Link>
      </div>

      {/* 검색 페이지 링크 */}
      <div
        className={`${styles.logo} ${
          router.pathname === "/search" ? styles.active : ""
        }`}
      >
        <Link href="/search">
          <img src={"/address.svg"} alt="주소 검색" title="주소 검색" />
        </Link>
      </div>
    </div>
  );
}
