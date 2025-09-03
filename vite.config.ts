import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Only import server utilities if in dev mode
let createServer: (() => any) | undefined;
if (process.env.NODE_ENV === "development") {
  // dynamic import so build on Vercel won’t fail
  createServer = require("./server").createServer;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [
    react(),
    mode === "development" && expressPlugin(), // use Express only in dev
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during dev
    configureServer(server) {
      if (createServer) {
        const app = createServer();
        server.middlewares.use(app);
      }
    },
  };
}
