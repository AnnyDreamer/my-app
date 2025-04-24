const express = require("express");
const cors = require("cors");
const { eventsDb, constitutionDb, questionDb } = require("./db");

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 获取所有事件
app.get("/api/events", (req, res) => {
  eventsDb.all("SELECT * FROM events ORDER BY date DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取特定月份的事件
app.get("/api/events/month/:yearMonth", (req, res) => {
  const { yearMonth } = req.params;
  // 验证日期格式 (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    res.status(400).json({ error: "Invalid date format. Use YYYY-MM" });
    return;
  }

  const [year, month] = yearMonth.split("-");
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  eventsDb.all(
    "SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date DESC",
    [startDate, endDate],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// 获取特定日期的事件
app.get("/api/events/:date", (req, res) => {
  const { date } = req.params;
  eventsDb.all("SELECT * FROM events WHERE date = ?", [date], (err, rows) => {
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

  eventsDb.run(
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
  eventsDb.run("DELETE FROM events WHERE id = ?", [id], function (err) {
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

  eventsDb.run(
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

// 获取所有体质类型
app.get("/api/constitution-types", (req, res) => {
  constitutionDb.all("SELECT * FROM constitution_types", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(
      rows.map((row) => ({
        ...row,
        tags: JSON.parse(row.tags),
      }))
    );
  });
});

// 根据ID查询体质类型
app.get("/api/constitution-types/:id", (req, res) => {
  const { id } = req.params;
  constitutionDb.get(
    "SELECT * FROM constitution_types WHERE id = ?",
    [id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: "体质类型不存在" });
        return;
      }
      res.json({
        ...row,
        tags: JSON.parse(row.tags),
      });
    }
  );
});

// 根据标签查询体质类型
app.get("/api/constitution-types/tag/:tag", (req, res) => {
  const { tag } = req.params;
  constitutionDb.all("SELECT * FROM constitution_types", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const filteredRows = rows.filter((row) => {
      const tags = JSON.parse(row.tags);
      return tags.includes(tag);
    });
    res.json(
      filteredRows.map((row) => ({
        ...row,
        tags: JSON.parse(row.tags),
      }))
    );
  });
});

// 根据名称搜索体质类型
app.get("/api/constitution-types/search/:keyword", (req, res) => {
  const { keyword } = req.params;
  constitutionDb.all(
    "SELECT * FROM constitution_types WHERE name LIKE ? OR description LIKE ?",
    [`%${keyword}%`, `%${keyword}%`],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(
        rows.map((row) => ({
          ...row,
          tags: JSON.parse(row.tags),
        }))
      );
    }
  );
});

// 获取所有问题
app.get("/api/questions", (req, res) => {
  questionDb.all("SELECT * FROM questions", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(
      rows.map((row) => ({
        ...row,
        options: JSON.parse(row.options),
        relatedConstitutions: JSON.parse(row.relatedConstitutions),
      }))
    );
  });
});

// 根据ID查询问题
app.get("/api/questions/:id", (req, res) => {
  const { id } = req.params;
  questionDb.get("SELECT * FROM questions WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "问题不存在" });
      return;
    }
    res.json({
      ...row,
      options: JSON.parse(row.options),
      relatedConstitutions: JSON.parse(row.relatedConstitutions),
    });
  });
});

// 根据体质类型查询相关问题
app.get("/api/questions/constitution/:constitution", (req, res) => {
  const { constitution } = req.params;
  questionDb.all("SELECT * FROM questions", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const filteredRows = rows.filter((row) => {
      const relatedConstitutions = JSON.parse(row.relatedConstitutions);
      return relatedConstitutions.includes(constitution);
    });
    res.json(
      filteredRows.map((row) => ({
        ...row,
        options: JSON.parse(row.options),
        relatedConstitutions: JSON.parse(row.relatedConstitutions),
      }))
    );
  });
});

// 启动服务器
const startServer = (port) => {
  app
    .listen(port, () => {
      console.log(`Server is running on port ${port}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error("Server error:", err);
      }
    });
};

startServer(port);
