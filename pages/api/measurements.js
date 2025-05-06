import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { method } = req;
  const dataFilePath = path.join(process.cwd(), "db.json");

  try {
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(fileData);

    switch (method) {
      case "GET":
        // 모든 건물의 측정 데이터를 합쳐서 반환
        const allMeasurements = [];
        if (data.buildings) {
          data.buildings.forEach((building) => {
            if (building.measurements) {
              building.measurements.forEach((measurement) => {
                allMeasurements.push({
                  ...measurement,
                  buildingId: building.id,
                  buildingName: building.name,
                });
              });
            }
          });
        }
        res.status(200).json(allMeasurements);
        break;
      case "POST":
        // 새 측정 데이터 추가
        const newMeasurement = req.body;
        const { buildingId } = newMeasurement;

        // 건물 ID가 없으면 오류
        if (!buildingId) {
          return res.status(400).json({ error: "건물 ID가 필요합니다." });
        }

        // 해당 건물 찾기
        const buildingIndex = data.buildings.findIndex(
          (b) => b.id === buildingId
        );
        if (buildingIndex === -1) {
          return res
            .status(404)
            .json({ error: "해당 건물을 찾을 수 없습니다." });
        }

        // 측정 데이터에 ID 추가
        if (!newMeasurement.id) {
          newMeasurement.id = Date.now().toString();
        }

        // 건물의 measurements 배열이 없으면 생성
        if (!data.buildings[buildingIndex].measurements) {
          data.buildings[buildingIndex].measurements = [];
        }

        // 새 측정 데이터 추가
        data.buildings[buildingIndex].measurements.push(newMeasurement);

        // 파일에 저장
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

        res.status(201).json(newMeasurement);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("API 오류:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
}
