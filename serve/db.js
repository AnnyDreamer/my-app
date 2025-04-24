const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 创建事件数据库连接
const eventsDbPath = path.join(__dirname, "events.db");
const eventsDb = new sqlite3.Database(eventsDbPath, (err) => {
  if (err) {
    console.error("❌ Error opening events database:", err);
  } else {
    console.log("Connected to the events SQLite database ✨");
    // 创建事件表
    eventsDb.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// 创建体质类型数据库连接
const constitutionDbPath = path.join(__dirname, "constitution.db");
const constitutionDb = new sqlite3.Database(constitutionDbPath, (err) => {
  if (err) {
    console.error("❌ Error opening constitution database:", err);
  } else {
    console.log("Connected to the constitution SQLite database ✨");
    // 创建体质类型表
    constitutionDb.run(`
      CREATE TABLE IF NOT EXISTS constitution_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        tags TEXT NOT NULL
      )
    `);
  }
});

// 创建问题数据库连接
const questionDbPath = path.join(__dirname, "question.db");
const questionDb = new sqlite3.Database(questionDbPath, (err) => {
  if (err) {
    console.error("❌ Error opening question database:", err);
  } else {
    console.log("Connected to the question SQLite database ✨");
    // 创建问题表
    questionDb.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT NOT NULL,
        relatedConstitutions TEXT NOT NULL,
        score_weights TEXT NOT NULL
      )
    `);
  }
});

module.exports = {
  eventsDb,
  constitutionDb,
  questionDb,
};
