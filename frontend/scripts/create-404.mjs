import { copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexFile = path.join(distDir, "index.html");
const notFoundFile = path.join(distDir, "404.html");

const run = async () => {
  await access(indexFile, constants.F_OK);
  await copyFile(indexFile, notFoundFile);
  console.log("Generated dist/404.html for SPA fallback.");
};

run().catch((error) => {
  console.error("Could not generate dist/404.html:", error);
  process.exitCode = 1;
});
