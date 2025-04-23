const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 创建数据库连接
const db = new sqlite3.Database(path.join(__dirname, "events.db"), (err) => {
  if (err) {
    console.error("❌ Error opening database:", err);
  } else {
    console.log("Connected to the SQLite database ✨");
    // 创建事件表
    db.run(`
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

module.exports = db;
