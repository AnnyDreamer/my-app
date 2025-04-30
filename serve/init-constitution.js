const { constitutionDb } = require("./db");

// 体质类型数据
const constitutionTypes = [
  {
    id: "pinghe",
    name: "平和质",
    description: "阴阳气血调和，以体态适中、面色红润、精力充沛等为主要特征。",
    recommendation: "保持规律作息，饮食有节，适量运动，保持心情愉悦。",
    tags: ["健康", "平衡"],
  },
  {
    id: "qixu",
    name: "气虚质",
    description: "元气不足，以疲乏、气短、自汗等气虚表现为主要特征。",
    recommendation: "适当运动，避免过度劳累，饮食宜清淡，可适当食用补气食物。",
    tags: ["疲乏", "气短"],
  },
  {
    id: "yangxu",
    name: "阳虚质",
    description: "阳气不足，以畏寒怕冷、手足不温等虚寒表现为主要特征。",
    recommendation: "注意保暖，避免受寒，适当食用温补食物，保持规律作息。",
    tags: ["畏寒", "怕冷"],
  },
  {
    id: "yinxu",
    name: "阴虚质",
    description: "阴液亏少，以口燥咽干、手足心热等虚热表现为主要特征。",
    recommendation: "避免熬夜，饮食宜清淡，可适当食用滋阴食物，保持心情平和。",
    tags: ["燥热", "口干"],
  },
  {
    id: "tanshi",
    name: "痰湿质",
    description:
      "痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等痰湿表现为主要特征。",
    recommendation: "饮食清淡，避免油腻，适当运动，保持规律作息。",
    tags: ["肥胖", "痰湿"],
  },
  {
    id: "shire",
    name: "湿热质",
    description: "湿热内蕴，以面垢油光、口苦、苔黄腻等湿热表现为主要特征。",
    recommendation: "饮食清淡，避免辛辣，保持规律作息，适当运动。",
    tags: ["湿热", "口苦"],
  },
  {
    id: "xueyu",
    name: "血瘀质",
    description: "血行不畅，以肤色晦暗、舌质紫暗等血瘀表现为主要特征。",
    recommendation: "适当运动，保持心情愉悦，饮食宜清淡，可适当食用活血食物。",
    tags: ["血瘀", "晦暗"],
  },
  {
    id: "qiyu",
    name: "气郁质",
    description: "气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主要特征。",
    recommendation: "保持心情愉悦，适当运动，饮食宜清淡，保持规律作息。",
    tags: ["抑郁", "忧虑"],
  },
  {
    id: "tebing",
    name: "特禀质",
    description: "先天失常，以生理缺陷、过敏反应等为主要特征。",
    recommendation: "避免接触过敏原，保持规律作息，饮食宜清淡，适当运动。",
    tags: ["过敏", "特禀"],
  },
];

// 初始化数据库
constitutionDb.serialize(() => {
  // 删除旧表
  constitutionDb.run("DROP TABLE IF EXISTS constitution_types", (err) => {
    if (err) {
      console.error("Error dropping constitution_types table:", err);
      return;
    }
    console.log("Dropped old constitution_types table");

    // 创建新表
    constitutionDb.run(
      `
      CREATE TABLE constitution_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        tags TEXT NOT NULL
      )
    `,
      (err) => {
        if (err) {
          console.error("Error creating constitution_types table:", err);
          return;
        }
        console.log("Created new constitution_types table");

        // 插入新数据
        const stmt = constitutionDb.prepare(
          "INSERT INTO constitution_types (id, name, description, recommendation, tags) VALUES (?, ?, ?, ?, ?)"
        );

        constitutionTypes.forEach((type) => {
          stmt.run(
            type.id,
            type.name,
            type.description,
            type.recommendation,
            JSON.stringify(type.tags),
            (err) => {
              if (err) {
                console.error(
                  `Error inserting constitution type ${type.id}:`,
                  err
                );
              } else {
                console.log(
                  `Inserted constitution type ${type.id} successfully`
                );
              }
            }
          );
        });

        stmt.finalize((err) => {
          if (err) {
            console.error("Error finalizing statement:", err);
          } else {
            console.log("All constitution types inserted successfully");
            process.exit(0);
          }
        });
      }
    );
  });
});
