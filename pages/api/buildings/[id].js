import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  const dataFilePath = path.join(process.cwd(), "db.json");

  try {
    const fileData = fs.readFileSync(dataFilePath, "utf8");
    const data = JSON.parse(fileData);

    switch (method) {
      case "DELETE":
        // 해당 ID의 건물 찾기
        const buildingIndex = data.buildings.findIndex(
          (building) => building.id === id
        );

        if (buildingIndex === -1) {
          return res
            .status(404)
            .json({ error: "해당 건물을 찾을 수 없습니다." });
        }

        // 건물 삭제
        data.buildings.splice(buildingIndex, 1);

        // 파일에 저장
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

        res.status(200).json({ message: "건물이 성공적으로 삭제되었습니다." });
        break;
      default:
        res.setHeader("Allow", ["DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error("API 오류:", error);
    res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
}
