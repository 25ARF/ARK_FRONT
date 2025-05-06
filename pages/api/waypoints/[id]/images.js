import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
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
    console.log("웨이포인트 이미지 API 요청 받음:", id);

    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(fileData);

    switch (method) {
      case "GET":
        let foundWaypoint = null;
        let buildingName = "";

        // 모든 건물을 순회하며 해당 id의 웨이포인트를 찾음
        for (const building of data.buildings) {
          if (building.measurements) {
            const waypoint = building.measurements.find(
              (wp) => wp.id.toString() === id
            );
            if (waypoint) {
              foundWaypoint = waypoint;
              buildingName = building.name;
              break;
            }
          }
        }

        if (!foundWaypoint) {
          console.log("웨이포인트를 찾을 수 없음:", id);
          return res
            .status(404)
            .json({ error: "해당 웨이포인트를 찾을 수 없습니다." });
        }

        console.log("웨이포인트 데이터 찾음:", foundWaypoint.label);

        // 웨이포인트의 모든 측정 데이터에서 이미지 추출
        const images = foundWaypoint.measurements
          .filter((m) => m.imageUrl)
          .map((m) => ({
            imageUrl: validateImageUrl(m.imageUrl),
            date: m.date,
            width_mm: m.width_mm,
            timestamp: new Date(m.date).getTime(),
          }));

        console.log(`웨이포인트 ${id}의 이미지 수:`, images.length);

        return res.status(200).json({
          waypointId: foundWaypoint.id,
          waypointLabel: foundWaypoint.label,
          buildingName: buildingName,
          images: images,
        });

      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("API 오류:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
}
