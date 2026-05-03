import "dotenv/config";
import express from "express";
import cors from "cors";
import { getDb } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import districtRoutes from "./routes/districts.js";
import knowledgeRoutes from "./routes/knowledge.js";
import reportRoutes from "./routes/reports.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const corsOriginRaw = process.env.CORS_ORIGIN || "http://localhost:5173";
// "*" allows any origin (with credentials reflected); comma-separated values work too.
const corsOrigin = corsOriginRaw === "*" ? true : corsOriginRaw.split(",").map((s) => s.trim());

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Open the DB on boot so seeding errors surface immediately
getDb();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server]", err);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`[rashid-backend] listening on http://localhost:${port}`);
  console.log(`[rashid-backend] CORS origin: ${corsOrigin}`);
});
