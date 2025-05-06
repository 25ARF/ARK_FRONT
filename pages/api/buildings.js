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
        res.status(200).json(data.buildings || []);
        break;
      case "POST":
        // 새 건물 데이터 추가
        const newBuilding = req.body;

        // ID가 없는 경우 새 ID 생성
        if (!newBuilding.id) {
          newBuilding.id = Date.now().toString();
        }

        // location 객체 생성
        newBuilding.location = {
          longitude: newBuilding.lng,
          latitude: newBuilding.lat,
        };

        // 기존 lng, lat 속성 제거
        delete newBuilding.lng;
        delete newBuilding.lat;

        // measurements 배열이 없으면 초기화
        if (!newBuilding.measurements) {
          newBuilding.measurements = [];
        }

        // buildings 배열이 없으면 초기화
        if (!data.buildings) {
          data.buildings = [];
        }

        // 중복 체크 (주소 기준)
        const existingBuilding = data.buildings.find(
          (building) => building.address === newBuilding.address
        );

        if (existingBuilding) {
          return res.status(400).json({
            error: "이미 등록된 건물입니다.",
            building: existingBuilding,
          });
        }

        // 새 건물 추가
        data.buildings.push(newBuilding);

        // 파일에 저장
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

        res.status(201).json(newBuilding);
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
