import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const resolvedBasePath = (() => {
  const rawBasePath = process.env.BASE_PATH || "/";
  if (rawBasePath === "/") return "/";

  const withLeadingSlash = rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
})();

export default defineConfig({
  base: resolvedBasePath,
  plugins: [react()],
  server: {
    port: 5173
  }
});
