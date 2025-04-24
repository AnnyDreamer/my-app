const { questionDb } = require("./db");
const fs = require("fs");
const path = require("path");

// 读取问题数据
const questionsPath = path.join(__dirname, "questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

// 初始化数据库
questionDb.serialize(() => {
  // 删除旧表
  questionDb.run("DROP TABLE IF EXISTS questions", (err) => {
    if (err) {
      console.error("Error dropping questions table:", err);
      return;
    }
    console.log("Dropped old questions table");

    // 创建新表
    questionDb.run(
      `
      CREATE TABLE questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT NOT NULL,
        relatedConstitutions TEXT NOT NULL,
        score_weights TEXT NOT NULL
      )
    `,
      (err) => {
        if (err) {
          console.error("Error creating questions table:", err);
          return;
        }
        console.log("Created new questions table");

        // 插入新数据
        const stmt = questionDb.prepare(
          "INSERT INTO questions (id, question, type, options, relatedConstitutions, score_weights) VALUES (?, ?, ?, ?, ?, ?)"
        );

        // 定义选项和分值
        const options = [
          { value: "1", text: "从不", score: 1 },
          { value: "2", text: "偶尔", score: 2 },
          { value: "3", text: "有时", score: 3 },
          { value: "4", text: "经常", score: 4 },
          { value: "5", text: "总是", score: 5 },
        ];

        // 处理嵌套的数组结构
        const flattenQuestions = (arr) => {
          return arr.reduce((flat, item) => {
            if (Array.isArray(item)) {
              return flat.concat(flattenQuestions(item));
            }
            return flat.concat(item);
          }, []);
        };

        const flatQuestions = flattenQuestions(questions);

        // 验证并插入问题
        flatQuestions.forEach((q) => {
          if (!q.id || !q.question || !q.relatedConstitutions) {
            console.error("Invalid question data:", q);
            return;
          }

          stmt.run(
            q.id,
            q.question,
            "single", // 所有问题都是单选题
            JSON.stringify(options),
            JSON.stringify(q.relatedConstitutions),
            JSON.stringify(options.map((opt) => opt.score)), // 存储分值权重
            (err) => {
              if (err) {
                console.error(`Error inserting question ${q.id}:`, err);
              } else {
                console.log(`Inserted question ${q.id} successfully`);
              }
            }
          );
        });

        stmt.finalize((err) => {
          if (err) {
            console.error("Error finalizing statement:", err);
          } else {
            console.log("All questions inserted successfully");
            process.exit(0);
          }
        });
      }
    );
  });
});
