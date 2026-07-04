import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 读取根目录 `.env` 中的键值对。
 * 这里只处理部署脚本依赖的简单场景，避免额外引入解析依赖。
 */
function readEnvFile(envPath) {
  const content = readFileSync(envPath, "utf8");
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, "$1");
    result[key] = value;
  }

  return result;
}

/**
 * 根据 `DATABASE_URL` 解析 MySQL 连接信息，并创建数据库。
 */
function ensureDatabase() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    throw new Error("Missing .env file. Please create database connection settings first.");
  }

  const env = readEnvFile(envPath);
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing in .env.");
  }

  const url = new URL(databaseUrl);
  if (url.protocol !== "mysql:") {
    throw new Error(`This script only supports MySQL. Current protocol: ${url.protocol}`);
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!databaseName) {
    throw new Error("DATABASE_URL does not contain a database name.");
  }

  const mysqlArgs = [
    "-h",
    url.hostname || "127.0.0.1",
    "-P",
    url.port || "3306",
    "-u",
    decodeURIComponent(url.username),
    `-p${decodeURIComponent(url.password)}`,
    "-e",
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  ];

  try {
    execFileSync("mysql", mysqlArgs, { stdio: "inherit" });
  } catch (error) {
    throw new Error(
      "Failed to create database with mysql. Ensure the MySQL client is installed and mysql is available in PATH.",
      { cause: error },
    );
  }
}

ensureDatabase();
console.log("Database is ready.");
