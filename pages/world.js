import { useEffect } from "react";
import Head from "next/head";
import VWorldMap from "../components/VWorldMaps";

export default function World() {
  useEffect(() => {
    // VWorld 맵 스크립트 동적 로드
    const script = document.createElement("script");
    script.src =
      "https://map.vworld.kr/js/webglMapInit.js.do?version=3.0&apiKey=C61D7E01-1BDE-356E-B6DC-00A20611498F&domain=http://localhost:3000/";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Head>
        <title>VWorld Map</title>
        <meta name="description" content="VWorld Map Test" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h2>VWorld Map Test</h2>
        <VWorldMap />
      </main>
    </>
  );
}
