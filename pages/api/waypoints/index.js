import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { method } = req;
  const { date, buildingId } = req.query;
  const dataFilePath = path.join(process.cwd(), "db.json");

  // 이미지 URL이 유효한지 확인하고 필요하면 수정하는 함수
  const validateImageUrl = (url) => {
    if (!url) return null;

    // URL이 이미 절대 경로인 경우 그대로 반환
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // 상대 경로인 경우 슬래시로 시작하는지 확인하고 수정
    if (!url.startsWith("/")) {
      return `/${url}`;
    }

    return url;
  };

  try {
    console.log("API 요청 받음:", req.url);

    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(fileData);

    switch (method) {
      case "GET":
        // 건물 ID 기준 조회
        if (buildingId) {
          console.log("건물 ID로 조회:", buildingId);
          const building = data.buildings.find((b) => b.id === buildingId);

          if (!building) {
            console.log("건물을 찾을 수 없음:", buildingId);
            return res
              .status(404)
              .json({ error: "해당 건물을 찾을 수 없습니다." });
          }

          console.log("건물 데이터 찾음:", building.name);
          console.log("웨이포인트 수:", building.measurements?.length || 0);

          // 각 웨이포인트별로 가장 최근 데이터와 이미지 URL 추출
          const waypointImages = building.measurements.map((waypoint) => {
            // 각 웨이포인트의 측정값 중 마지막(가장 최근) 항목
            const latestMeasurement =
              waypoint.measurements && waypoint.measurements.length > 0
                ? waypoint.measurements[waypoint.measurements.length - 1]
                : null;

            const imageUrl = validateImageUrl(latestMeasurement?.imageUrl);
            console.log(
              `웨이포인트 ${waypoint.id}(${waypoint.label}) 이미지 URL:`,
              imageUrl
            );

            return {
              id: waypoint.id,
              label: waypoint.label,
              location: waypoint.location,
              imageUrl: imageUrl,
              date: latestMeasurement?.date || "",
              width_mm: latestMeasurement?.width_mm || 0,
            };
          });

          console.log("응답할 웨이포인트 이미지 수:", waypointImages.length);
          return res.status(200).json({
            buildingName: building.name,
            waypoints: waypointImages,
          });
        }

        // 날짜 기준 조회
        if (date) {
          console.log("날짜로 조회:", date);
          const waypointsByDate = [];

          // 모든 건물의 모든 웨이포인트 순회
          data.buildings.forEach((building) => {
            if (building.measurements) {
              building.measurements.forEach((waypoint) => {
                // 해당 날짜의 측정값 찾기
                const measurement = waypoint.measurements?.find(
                  (m) => m.date === date
                );
                if (measurement) {
                  const imageUrl = validateImageUrl(measurement.imageUrl);

                  waypointsByDate.push({
                    id: waypoint.id,
                    label: waypoint.label,
                    buildingId: building.id,
                    buildingName: building.name,
                    location: waypoint.location,
                    imageUrl: imageUrl,
                    date: measurement.date,
                    width_mm: measurement.width_mm,
                  });
                }
              });
            }
          });

          console.log("날짜 기준 웨이포인트 수:", waypointsByDate.length);
          return res.status(200).json(waypointsByDate);
        }

        // 필터 없이 모든 웨이포인트 목록 반환
        console.log("모든 웨이포인트 조회");
        const allWaypoints = [];
        data.buildings.forEach((building) => {
          if (building.measurements) {
            building.measurements.forEach((waypoint) => {
              allWaypoints.push({
                id: waypoint.id,
                label: waypoint.label,
                buildingId: building.id,
                buildingName: building.name,
                location: waypoint.location,
              });
            });
          }
        });

        console.log("총 웨이포인트 수:", allWaypoints.length);
        res.status(200).json(allWaypoints);
        break;

      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("API 오류:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
}
