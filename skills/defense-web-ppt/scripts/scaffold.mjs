import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const destination = process.argv[2];
if (!destination || !path.isAbsolute(destination)) {
  console.error("用法：node scaffold.mjs <绝对输出目录>");
  process.exit(2);
}

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "starter", "dist");
const target = path.resolve(destination);
if (existsSync(target) && readdirSync(target).length) {
  console.error("输出目录已有文件。请选择空目录，以免覆盖已有项目。");
  process.exit(2);
}
mkdirSync(target, { recursive: true });
cpSync(source, path.join(target, "dist"), { recursive: true });
console.log(JSON.stringify({ projectRoot: target, entry: path.join(target, "dist", "index.html") }));
