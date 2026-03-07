import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Turso / LibSQL Configuration
// Use TURSO_DATABASE_URL and TURSO_AUTH_TOKEN for remote Turso DB
// Fallback to local file for development
const dbUrl = process.env.TURSO_DATABASE_URL || "file:rdp_connections.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url: dbUrl,
  authToken: authToken,
});

// Initialize database
async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER DEFAULT 3389,
        username TEXT,
        group_name TEXT DEFAULT 'General',
        notes TEXT,
        last_connected DATETIME,
        favorite INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL
      )
    `);

    // Migrations: Add columns if they don't exist
    // Note: PRAGMA table_info might behave differently on remote LibSQL
    // We'll use a more robust check or just try/catch the ALTER TABLE
    try {
      await db.execute("ALTER TABLE connections ADD COLUMN favorite INTEGER DEFAULT 0");
    } catch (e) { /* Column might already exist */ }
    
    try {
      await db.execute("ALTER TABLE connections ADD COLUMN sort_order INTEGER DEFAULT 0");
    } catch (e) { /* Column might already exist */ }
    
  } catch (err) {
    console.error("Database initialization failed", err);
  }
}

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Routes
  app.get("/api/connections", async (req, res) => {
    try {
      const result = await db.execute("SELECT * FROM connections ORDER BY sort_order ASC, group_name ASC, name ASC");
      res.json(result.rows);
    } catch (err) {
      console.error('Fetch connections failed', err);
      res.status(500).json({ error: "Falha ao buscar conexões" });
    }
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const { name, host, port, username, group_name, notes, favorite } = req.body;
      if (!name || !host) {
        return res.status(400).json({ error: "Nome e Host são obrigatórios" });
      }
      
      // Get max sort_order
      const maxOrderResult = await db.execute("SELECT MAX(sort_order) as maxOrder FROM connections");
      const maxOrder = maxOrderResult.rows[0]?.maxOrder as number | null;
      const nextOrder = (maxOrder || 0) + 1;

      const result = await db.execute({
        sql: "INSERT INTO connections (name, host, port, username, group_name, notes, favorite, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [name, host, port || 3389, username, group_name || 'General', notes, favorite ? 1 : 0, nextOrder]
      });
      res.json({ id: result.lastInsertRowid?.toString() });
    } catch (err) {
      console.error('Create connection failed', err);
      res.status(500).json({ error: "Falha ao criar conexão" });
    }
  });

  app.put("/api/connections/:id", async (req, res) => {
    try {
      const { name, host, port, username, group_name, notes, favorite } = req.body;
      await db.execute({
        sql: "UPDATE connections SET name = ?, host = ?, port = ?, username = ?, group_name = ?, notes = ?, favorite = ? WHERE id = ?",
        args: [name, host, port, username, group_name, notes, favorite ? 1 : 0, req.params.id]
      });
      res.json({ success: true });
    } catch (err) {
      console.error('Update connection failed', err);
      res.status(500).json({ error: "Falha ao atualizar conexão" });
    }
  });

  app.delete("/api/connections/:id", async (req, res) => {
    try {
      await db.execute({
        sql: "DELETE FROM connections WHERE id = ?",
        args: [req.params.id]
      });
      res.json({ success: true });
    } catch (err) {
      console.error('Delete connection failed', err);
      res.status(500).json({ error: "Falha ao excluir conexão" });
    }
  });

  app.post("/api/connections/reorder", async (req, res) => {
    try {
      const { orders } = req.body; // Array of { id, sort_order }
      
      // LibSQL batch for transaction-like behavior
      const batch = orders.map((item: any) => ({
        sql: "UPDATE connections SET sort_order = ? WHERE id = ?",
        args: [item.sort_order, item.id]
      }));
      
      await db.batch(batch, "write");
      res.json({ success: true });
    } catch (err) {
      console.error('Reorder failed', err);
      res.status(500).json({ error: "Falha ao reordenar" });
    }
  });

  app.post("/api/connections/:id/favorite", async (req, res) => {
    try {
      const { favorite } = req.body;
      await db.execute({
        sql: "UPDATE connections SET favorite = ? WHERE id = ?",
        args: [favorite ? 1 : 0, req.params.id]
      });
      res.json({ success: true });
    } catch (err) {
      console.error('Toggle favorite failed', err);
      res.status(500).json({ error: "Falha ao favoritar" });
    }
  });

  app.post("/api/connections/:id/connect", async (req, res) => {
    try {
      await db.execute({
        sql: "UPDATE connections SET last_connected = CURRENT_TIMESTAMP WHERE id = ?",
        args: [req.params.id]
      });
      res.json({ success: true });
    } catch (err) {
      console.error('Update last connected failed', err);
      res.status(500).json({ error: "Falha ao atualizar último acesso" });
    }
  });

  app.post("/api/connections/reset", async (req, res) => {
    try {
      await db.batch([
        "DELETE FROM connections",
        { sql: "INSERT INTO activities (type, description) VALUES (?, ?)", args: ['reset', 'Banco de dados resetado para padrões de fábrica'] }
      ], "write");
      res.json({ success: true });
    } catch (err) {
      console.error('Reset database failed', err);
      res.status(500).json({ error: "Falha ao resetar banco de dados" });
    }
  });

  app.get("/api/activities", async (req, res) => {
    try {
      const result = await db.execute("SELECT * FROM activities ORDER BY timestamp DESC LIMIT 100");
      res.json(result.rows);
    } catch (err) {
      console.error('Fetch activities failed', err);
      res.status(500).json({ error: "Falha ao buscar atividades" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const { type, description, details } = req.body;
      await db.execute({
        sql: "INSERT INTO activities (type, description, details) VALUES (?, ?, ?)",
        args: [type, description, details]
      });
      res.json({ success: true });
    } catch (err) {
      console.error('Create activity failed', err);
      res.status(500).json({ error: "Falha ao registrar atividade" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const result = await db.execute("SELECT data FROM settings WHERE id = 1");
      if (result.rows.length > 0) {
        res.json(JSON.parse(result.rows[0].data as string));
      } else {
        res.json(null);
      }
    } catch (err) {
      console.error('Fetch settings failed', err);
      res.status(500).json({ error: "Falha ao buscar configurações" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const data = JSON.stringify(req.body);
      await db.execute({
        sql: "INSERT INTO settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data",
        args: [data]
      });
      res.json({ success: true });
    } catch (err) {
      console.error('Update settings failed', err);
      res.status(500).json({ error: "Falha ao atualizar configurações" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
