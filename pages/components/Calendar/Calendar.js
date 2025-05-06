// React Hook 및 스타일 가져오기
import React, { useState } from "react";
import styles from "./Calendar.module.css";

/**
 * Calendar 컴포넌트
 * 월별 달력을 표시하고 날짜 선택 기능을 제공합니다.
 * 이전/다음 달 이동, 날짜 선택, 오늘 날짜 표시 등의 기능이 포함됩니다.
 *
 * @param {Object} props - 컴포넌트 props
 * @param {Function} props.onDateClick - 날짜 클릭 시 호출될 콜백 함수
 * @param {Date|null} props.selectedDate - 선택된 날짜 객체
 */
const Calendar = ({ onDateClick, selectedDate }) => {
  // 현재 달력에 표시할 날짜 상태 관리
  const [date, setDate] = useState(new Date());

  // 현재 연도 및 월 (0부터 시작)
  const year = date.getFullYear();
  const month = date.getMonth();
  // 오늘 날짜 객체
  const today = new Date();

  // 달력 계산에 필요한 값들
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이번 달 총 일수
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 이번 달 시작 요일 (0=일)
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate(); // 저번 달 마지막 날짜

  // 날짜 칸(div)들을 담을 배열
  const days = [];

  // 이전 달 날짜 채우기 (첫 주 빈 공간)
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevMonthDay = lastDayOfPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, prevMonthDay);
    days.push(
      <div
        key={`prev-${prevMonthDay}`}
        className={`${styles.day} ${styles.prevNextMonthDay}`} // 흐린 스타일 적용
        onClick={() => onDateClick(prevMonthDate)} // 클릭 시 콜백 호출
      >
        {prevMonthDay}
      </div>
    );
  }

  // 현재 달 날짜 채우기
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = new Date(year, month, i);
    // 선택된 날짜인지 확인
    const isSelected =
      selectedDate && fullDate.toDateString() === selectedDate.toDateString();
    // 오늘 날짜인지 확인
    const isToday = today.toDateString() === fullDate.toDateString();

    days.push(
      <div
        key={i}
        className={`${styles.day} ${isSelected ? styles.selected : ""} ${
          isToday ? styles.today : "" // 오늘 날짜 스타일
        }`}
        onClick={() => onDateClick(fullDate)} // 클릭 시 콜백 호출
      >
        {i}
      </div>
    );
  }

  // 다음 달 날짜 채우기 (마지막 주 빈 공간, 총 42칸 유지)
  let nextMonthDay = 1;
  while (days.length < 42) {
    const nextMonthDate = new Date(year, month + 1, nextMonthDay);
    days.push(
      <div
        key={`next-${nextMonthDay}`}
        className={`${styles.day} ${styles.prevNextMonthDay}`} // 흐린 스타일 적용
        onClick={() => onDateClick(nextMonthDate)} // 클릭 시 콜백 호출
      >
        {nextMonthDay}
      </div>
    );
    nextMonthDay++;
  }

  /**
   * 이전 달로 이동하는 함수
   * 현재 표시 중인 달의 이전 달로 달력을 변경합니다.
   */
  const goToPrevMonth = () => {
    setDate(new Date(year, month - 1, 1));
  };

  /**
   * 다음 달로 이동하는 함수
   * 현재 표시 중인 달의 다음 달로 달력을 변경합니다.
   */
  const goToNextMonth = () => {
    setDate(new Date(year, month + 1, 1));
  };

  // 월 이름 배열 (헤더 표시용)
  const monthNames = [
    "January 01",
    "February 02",
    "March 03",
    "April 04",
    "May 05",
    "June 06",
    "July 07",
    "August 08",
    "September 09",
    "October 10",
    "November 11",
    "December 12",
  ];

  // 달력 UI 렌더링
  return (
    <div className={styles.calendar} style={{ height: "300px" }}>
      {/* 헤더: 월, 연도, 이동 버튼 */}
      <div className={styles.header}>
        <h1>{monthNames[month]}</h1> {/* 월 표시 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "1.75rem",
          }}
        >
          <button onClick={goToPrevMonth}>&lt;</button> {/* 이전 달 버튼 */}
          <h2>{year}</h2> {/* 연도 표시 */}
          <button onClick={goToNextMonth}>&gt;</button> {/* 다음 달 버튼 */}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className={styles.weekdays}>
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* 날짜 그리드 */}
      <div className={styles.days}>{days}</div>
    </div>
  );
};

// 컴포넌트 내보내기
export default Calendar;
