// components/RightSidebar.js
import styles from "./RightSidebar.module.css";
import { FaTimes } from "react-icons/fa"; // 닫기 아이콘 가져오기
import { forwardRef } from "react";

/**
 * RightSidebar 컴포넌트
 * 오른쪽에서 슬라이드인 되는 사이드바 컴포넌트입니다.
 * 사용자 프로필 정보와 설정 메뉴를 표시합니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.isOpen - 사이드바 열림 상태
 * @param {Function} props.onClose - 사이드바 닫기 함수
 * @param {React.Ref} ref - 부모 컴포넌트에서 전달된 ref
 */
const RightSidebar = forwardRef(({ isOpen, onClose }, ref) => {
  return (
    <div
      className={`${styles.rightSidebar} ${isOpen ? styles.open : ""}`}
      ref={ref} // 외부 클릭 감지를 위한 ref 연결
    >
      {/* 닫기 버튼 */}
      <button className={styles.closeButton} onClick={onClose}>
        <FaTimes />
      </button>

      {/* 마이페이지 제목 */}
      <h2>마이페이지</h2>

      {/* 사용자 프로필 정보 섹션 */}
      <div className={styles.profile}>
        {/* 프로필 아이콘 */}
        <div className={styles.profileIcon}>프</div>

        {/* 사용자 정보 (추후 실제 데이터로 대체) */}
        <p>이름: {/* 사용자 이름 */}</p>
        <p>ID: {/* 사용자 ID */}</p>
        {/* 추가적인 프로필 정보 */}
      </div>

      {/* 설정 메뉴 섹션 */}
      <div className={styles.settings}>
        <h3>설정</h3>
        <ul>
          <li>계정 정보</li>
          <li>알림 설정</li>
          <li>로그아웃</li>
        </ul>
      </div>
    </div>
  );
});

// 디버깅을 위한 컴포넌트 표시 이름 설정
RightSidebar.displayName = "RightSidebar";

export default RightSidebar;
