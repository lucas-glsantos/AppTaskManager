import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setServers } from "node:dns/promises";

import { protect } from "./src/middleware/authMiddleware.js";
import { connectDB } from "./src/config/db.js";
import tasksRoutes from "./src/routes/tasksRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeOrigin = (value) => {
	if (!value) return null;

	try {
		const url = new URL(value.trim());
		return `${url.protocol}//${url.host}`;
	} catch {
		return value.trim().replace(/\/+$/, "");
	}
};

const isDev = process.env.NODE_ENV !== "production";

const configuredOrigins = [
	process.env.CLIENT_ORIGIN,
	...(process.env.CLIENT_ORIGINS ?? "").split(","),
	"https://web-taskmanager.vercel.app",
	...(isDev ? ["http://localhost:5173", "http://127.0.0.1:5173"] : []),
]
	.map(normalizeOrigin)
	.filter(Boolean);

const PRIVATE_IPV4 =
	/^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;

const isPrivateDevOrigin = (origin) => {
	if (!isDev) return false;

	try {
		const { protocol, hostname } = new URL(origin);
		if (protocol !== "http:" && protocol !== "https:") return false;

		const host = hostname.replace(/^\[|\]$/g, "");

		if (
			host === "localhost" ||
			host === "127.0.0.1" ||
			host === "::1" ||
			host === "0.0.0.0"
		) {
			return true;
		}

		return host.endsWith(".local") || PRIVATE_IPV4.test(host);
	} catch {
		return false;
	}
};

const isVercelPreviewOrigin = (origin) => {
	if (process.env.VERCEL_ENV !== "preview") return false;

	try {
		const { protocol, hostname } = new URL(origin);
		return (
			protocol === "https:" &&
			/^web-taskmanager(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(hostname)
		);
	} catch {
		return false;
	}
};

const isAllowedOrigin = (origin) => {
	const normalized = normalizeOrigin(origin);
	if (!normalized) return false;

	return (
		configuredOrigins.includes(normalized) ||
		isPrivateDevOrigin(origin) ||
		isVercelPreviewOrigin(origin)
	);
};

app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin) return cb(null, true);

			if (isAllowedOrigin(origin)) return cb(null, true);
			// Bloqueio Padrão
			return cb(new Error("CORS_BLOCKED"));
		},
		credentials: true, // Permite envio de cookies/tokens de sessão
	}),
);

app.use(express.json());

if (process.env.VERCEL) {
	app.use("/api", async (req, res, next) => {
		try {
			await connectDB();
			next();
		} catch (error) {
			next(error);
		}
	});
}

app.use("/api/auth", authRoutes);
app.use("/api/tasks", protect, tasksRoutes);

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
	const dist = path.join(__dirname, "../client/dist");
	app.use(express.static(dist));

	// Express 5: "*" puro é inválido (path-to-regexp v8). Usar /*splat.
	app.get("/*splat", (req, res) => {
		res.sendFile(path.join(dist, "index.html"));
	});
}

// Error handler global ÚNICO (elimina os handlers duplicados por router)
app.use((error, req, res, next) => {
	console.error("Erro não tratado:", error);
	if (error?.code === 11000) {
		return res.status(400).json({ message: "Email já cadastrado" });
	}
	if (error?.name === "ValidationError") {
		return res.status(400).json({ message: "Dados inválidos", error: error.message });
	}
	if (error?.name === "CastError") {
		return res.status(400).json({ message: "ID inválido" });
	}
	if (error?.message === "CORS_BLOCKED") {
		return res.status(403).json({ message: "Origem não permitida" });
	}
	return res.status(500).json({ message: "Erro interno no servidor" });
});


if (!process.env.VERCEL) {
	try {
		setServers(['1.1.1.1', '8.8.8.8']); // DNS públicos (evita querySrv ECONNREFUSED)
	} catch {}

	connectDB().then(() => {
		app.listen(PORT, HOST, () => {
			console.log(" ".repeat(50));
			console.log(`servidor conectado em http://${HOST}:${PORT}`);
			console.log(" ".repeat(50));
			console.log("-".repeat(50));
		});
	});
};

export default app;