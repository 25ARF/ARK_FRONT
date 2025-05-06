// components/CalendarCard.js
// 스타일 파일과 Calendar 컴포넌트 가져오기
import styles from "./CalendarCard.module.css";
import Calendar from "./Calendar/Calendar";

/**
 * CalendarCard 컴포넌트
 * Calendar 컴포넌트를 카드 형태로 감싸 표시합니다.
 * 날짜 선택 기능을 제공하는 달력 카드입니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Date|null} props.selectedDate - 선택된 날짜 객체
 * @param {Function} props.onDateClick - 날짜 클릭 시 호출될 핸들러 함수
 */
export default function CalendarCard({ selectedDate, onDateClick }) {
  return (
    // 카드 전체를 감싸는 div
    <div className={styles.cardWrapper}>
      {/* 실제 카드 스타일이 적용될 div */}
      <div className={styles.card}>
        {/* Calendar 컴포넌트 렌더링 */}
        <Calendar onDateClick={onDateClick} selectedDate={selectedDate} />
      </div>
    </div>
  );
}

// CalendarCard 컴포넌트 기본 내보내기
