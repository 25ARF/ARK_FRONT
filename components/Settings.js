// pages/settings.js
import React from "react";
import Layout from "../components/Layout";
import styles from "./settings.module.css";

/**
 * Settings 컴포넌트
 * 애플리케이션 설정을 관리하는 컴포넌트입니다.
 * 사용자가 환경 설정을 변경할 수 있는 인터페이스를 제공합니다.
 * 현재는 기본 구조만 제공되어 있으며, 향후 기능 확장이 가능합니다.
 */
const Settings = () => {
  return (
    <Layout>
      <div className={styles.container}>
        {/* 설정 제목 */}
        <h2 className={styles.title}>환경 설정</h2>

        {/* 설정 섹션 (향후 확장 예정) */}
        <div className={styles.section}>
          {/* 아직 구현되지 않은 설정 옵션들이 이곳에 추가될 예정입니다 */}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
