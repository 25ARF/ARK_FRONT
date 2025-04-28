// 스타일, React Hooks, 이미지 팝업 컴포넌트, axios 가져오기
import styles from "./CrackPhotoCard.module.css";
import { useState, useEffect } from "react";
import ImagePopup from "./ImagePopup"; // 이미지 상세보기 팝업
import axios from "../lib/axios"; // API 통신 라이브러리

// 균열 사진 목록을 표시하는 카드 컴포넌트
// selectedDate prop을 받아 해당 날짜 데이터 또는 선택된 웨이포인트 데이터를 보여줌
export default function CrackPhotoCard({ selectedDate }) {
  // 상태 변수들
  const [crackData, setCrackData] = useState(null); // 날짜 기준으로 가져온 전체 이미지 데이터
  const [isLoading, setIsLoading] = useState(false); // 데이터 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지 상태
  const [selectedImage, setSelectedImage] = useState(null); // 클릭해서 크게 볼 이미지 정보
  const [selectedWaypoint, setSelectedWaypoint] = useState(null); // 지도(Cesium)에서 선택된 웨이포인트 이름
  const [images, setImages] = useState([]); // 선택된 웨이포인트에 해당하는 이미지 목록

  // (현재 JSX에서 사용되지 않음) 더보기 기능 함수
  const handleShowMore = () => {
    // setVisibleImages((prev) => prev + 6); // 예시: 6개씩 더 보여주기
  };

  // 컴포넌트 마운트 시 'waypointSelect' 이벤트 리스너 설정
  useEffect(() => {
    // Cesium 지도에서 웨이포인트 선택 시 발생하는 커스텀 이벤트 처리 함수
    const handleWaypointSelect = async (event) => {
      const { waypointId, waypointName } = event.detail; // 이벤트 데이터에서 ID와 이름 추출

      // waypointId가 없으면(선택 해제 등) 관련 상태 초기화
      if (!waypointId) {
        setSelectedWaypoint(null); // 선택된 웨이포인트 이름 초기화
        setImages([]); // 이미지 목록 초기화
        setCrackData(null); // 날짜 기준 데이터도 초기화 (선택적)
        return;
      }

      // 특정 웨이포인트가 선택된 경우
      setSelectedWaypoint(waypointName); // 웨이포인트 이름 상태 업데이트
      setIsLoading(true); // 로딩 시작
      setError(null); // 에러 초기화

      try {
        // 백엔드 API 호출: 특정 웨이포인트의 이미지 목록 요청
        const response = await axios.get(`/api/waypoints/${waypointId}/images`); // API 경로 예시
        // 응답 데이터에서 이미지 목록 추출 (데이터 구조에 맞게 조정 필요)
        const waypointData = response.data;
        setImages(waypointData.images || []); // images 상태 업데이트, 없으면 빈 배열
      } catch (error) {
        // API 요청 실패 시 에러 처리
        if (error.response && error.response.status === 404) {
          // 404 에러 (데이터 없음) 시 이미지 목록 비우기
          setImages([]);
        } else {
          // 그 외 에러 발생 시 에러 메시지 설정
          setError("이미지를 불러오는데 실패했습니다.");
        }
      } finally {
        // API 요청 완료 후 로딩 상태 종료
        setIsLoading(false);
      }
    };

    // window 객체에 이벤트 리스너 등록
    window.addEventListener("waypointSelect", handleWaypointSelect);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (메모리 누수 방지)
    return () => {
      window.removeEventListener("waypointSelect", handleWaypointSelect);
    };
  }, []); // 빈 배열: 마운트 시 1회만 실행

  // selectedDate prop이 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    // 데이터 로드 함수 정의
    const fetchData = async () => {
      // 선택된 날짜가 없으면 상태 초기화하고 종료
      if (!selectedDate) {
        setCrackData(null);
        setImages([]);
        setSelectedWaypoint(null);
        return;
      }

      // 로딩 시작 및 관련 상태 초기화
      setIsLoading(true);
      setError(null);
      setSelectedWaypoint(null); // 날짜 변경 시 선택된 웨이포인트 정보 초기화
      setImages([]); // 웨이포인트 이미지 목록 초기화

      try {
        // 날짜를 'YYYY-MM-DD' 형식으로 변환
        const formattedDate = selectedDate.toISOString().split("T")[0];
        // 백엔드 API 호출: 해당 날짜의 모든 웨이포인트 데이터 요청
        const response = await axios.get(
          `/api/waypoints?date=${formattedDate}`
        ); // API 경로 예시

        // API 응답 데이터를 처리하여 모든 이미지를 하나의 배열로 만듦
        const allImages = response.data.flatMap(
          (
            waypoint // 각 웨이포인트 순회
          ) =>
            (waypoint.images || []).map((image) => ({
              // 각 웨이포인트의 이미지 배열 순회
              ...image, // 기존 이미지 정보 복사
              waypointLabel:
                waypoint.label || waypoint.name || `WP ${waypoint.id}`, // 이미지 객체에 웨이포인트 라벨(또는 이름/ID) 추가
            }))
        );
        // 합쳐진 전체 이미지 목록을 crackData 상태에 저장
        setCrackData(allImages);
      } catch (error) {
        // API 요청 실패 시 에러 처리
        if (error.response && error.response.status === 404) {
          // 404 에러 (데이터 없음) 시 crackData null로 설정
          setCrackData(null);
        } else {
          // 그 외 에러 발생 시 에러 메시지 설정
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } finally {
        // API 요청 완료 후 로딩 상태 종료
        setIsLoading(false);
      }
    };

    // 데이터 로드 함수 실행
    fetchData();
  }, [selectedDate]); // selectedDate가 변경될 때마다 이 useEffect 실행

  // 이미지 클릭 시 호출되어 팝업으로 보여줄 이미지 상태 설정
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // 이미지 팝업 닫기 시 호출되어 선택된 이미지 상태 초기화
  const closePopup = () => {
    setSelectedImage(null);
  };

  // 컴포넌트 UI 렌더링
  return (
    <div className={styles.wrapper}>
      {/* 선택된 날짜 표시 헤더 (카드 뒤에 위치) */}
      {selectedDate && (
        <div className={`${styles.dateHeader} ${styles.fadeIn}`}>
          <img
            src="/folder_icon.svg" // 폴더 아이콘 이미지 경로
            alt="폴더 아이콘"
            className={styles.folderIcon}
          />
          {/* 선택된 날짜 텍스트 (지역 형식) */}
          <p className={styles.selectedDateText}>
            {selectedDate.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* 메인 카드 영역 (날짜 헤더 앞에 위치) */}
      <div className={styles.card}>
        {/* 로딩 중 표시 */}
        {isLoading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : /* 에러 발생 시 표시 */
        error ? (
          <div className={styles.error}>{error}</div>
        ) : /* 특정 웨이포인트가 선택된 경우 */
        selectedWaypoint ? (
          <div className={styles.imageDisplay}>
            {/* 해당 웨이포인트의 이미지가 있는 경우 */}
            {images.length > 0 ? (
              <div className={styles.imageGrid}>
                {/* 이미지 목록 순회하며 렌더링 */}
                {images.map((image, index) => (
                  <div key={index} className={styles.imageItem}>
                    <img
                      src={image.imageUrl} // 이미지 URL
                      alt={`균열 사진 ${index + 1}`}
                      onClick={() => handleImageClick(image)} // 클릭 시 팝업 열기
                    />
                    {/* 이미지 정보 (타임스탬프) */}
                    <div className={styles.imageInfo}>
                      <span className={styles.timestamp}>
                        {new Date(image.timestamp).toLocaleString()}{" "}
                        {/* 타임스탬프 지역 형식 변환 */}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 해당 웨이포인트 이미지가 없는 경우 */
              <div className={styles.placeholder}>
                <p>{selectedWaypoint}에 등록된 이미지가 없습니다.</p>
              </div>
            )}
          </div>
        ) : /* 날짜가 선택되었고, crackData가 있는 경우 (웨이포인트 미선택) */
        crackData ? (
          <div className={styles.imageDisplay}>
            <div className={styles.imageGrid}>
              {/* 해당 날짜의 전체 이미지 목록 순회하며 렌더링 */}
              {crackData.map((image, index) => (
                <div key={index} className={styles.imageItem}>
                  <img
                    src={image.imageUrl}
                    alt={`균열 사진 ${index + 1}`}
                    onClick={() => handleImageClick(image)}
                  />
                  {/* 이미지 정보 (웨이포인트 라벨, 타임스탬프) */}
                  <div className={styles.imageInfo}>
                    <span className={styles.waypointLabel}>
                      {image.waypointLabel}{" "}
                      {/* 이미지에 추가된 웨이포인트 라벨 표시 */}
                    </span>
                    <span className={styles.timestamp}>
                      {new Date(image.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 로딩/에러 아니고, 데이터도 없는 경우 (초기 상태 또는 데이터 없음) */
          <div className={styles.placeholder}>
            {/* 날짜와 웨이포인트 모두 선택 안 된 초기 상태 메시지 */}
            {!selectedDate && !selectedWaypoint ? (
              <p>날짜 또는 Waypoint를 선택해주세요</p>
            ) : (
              /* 날짜는 선택됐으나 해당 날짜 데이터가 없을 때 메시지 */
              <p>
                {selectedDate?.toLocaleDateString()}의 균열 사진 정보가
                없습니다.
              </p>
            )}
          </div>
        )}

        {/* 이미지 팝업: selectedImage 상태가 있을 때만 렌더링 */}
        {selectedImage && (
          <ImagePopup
            imageUrl={selectedImage.imageUrl} // 팝업에 표시할 이미지 URL 전달
            description={null} // 이미지 설명 (필요 시 추가)
            onClose={closePopup} // 팝업 닫기 함수 전달
          />
        )}
      </div>
    </div>
  );
}

// CrackPhotoCard 컴포넌트 내보내기
