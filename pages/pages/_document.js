import { Html, Head, Main, NextScript } from "next/document";

/**
 * 커스텀 Document 컴포넌트
 * 모든 페이지의 HTML 문서 구조를 정의합니다.
 * 서버 사이드 렌더링 시에만 실행되는 컴포넌트입니다.
 */
export default function Document() {
  return (
    <Html lang="ko">
      <Head>
        {/* 메타 태그, 글꼴, 외부 스크립트 등 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main /> {/* 페이지 컴포넌트가 렌더링될 위치 */}
        <NextScript /> {/* Next.js 스크립트가 자동으로 삽입됨 */}
      </body>
    </Html>
  );
}
