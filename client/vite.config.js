import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";
import react from "@vitejs/plugin-react";

const DEFAULT_API_TARGET = "http://127.0.0.1:5000";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const apiTarget = env.VITE_API_PROXY_TARGET || DEFAULT_API_TARGET;

	return {
		plugins: [react()],
		server: {
			host: true,
			port: 5173,
			strictPort: true,
			proxy: {
				"/api": {
					target: apiTarget,
					changeOrigin: true,
				},
			},
		},
		preview: {
			proxy: {
				"/api": {
					target: apiTarget,
					changeOrigin: true,
				},
			},
		},
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		build: {
			// Gera código nativo e moderno
			target: "es2022",
		},
	};
});
