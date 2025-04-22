const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 获取所有事件
app.get("/api/events", (req, res) => {
  db.all("SELECT * FROM events ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取特定日期的事件
app.get("/api/events/:date", (req, res) => {
  const { date } = req.params;
  db.all("SELECT * FROM events WHERE date = ?", [date], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加新事件
app.post("/api/events", (req, res) => {
  const { title, description, date } = req.body;

  if (!title || !date) {
    res.status(400).json({ error: "Title and date are required" });
    return;
  }

  db.run(
    "INSERT INTO events (title, description, date) VALUES (?, ?, ?)",
    [title, description, date],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        title,
        description,
        date,
      });
    }
  );
});

// 删除事件
app.delete("/api/events/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM events WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json({ message: "Event deleted successfully" });
  });
});

// 更新事件
app.put("/api/events/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, date } = req.body;

  if (!title || !date) {
    res.status(400).json({ error: "Title and date are required" });
    return;
  }

  db.run(
    "UPDATE events SET title = ?, description = ?, date = ? WHERE id = ?",
    [title, description, date, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: "Event not found" });
        return;
      }
      res.json({
        id,
        title,
        description,
        date,
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
