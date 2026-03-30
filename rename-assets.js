#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ASSETS_DIR = path.join(__dirname, "src/assets");

const dirs = fs
  .readdirSync(ASSETS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

for (const dir of dirs) {
  const dirPath = path.join(ASSETS_DIR, dir);
  const pattern = new RegExp(`^${dir}_\\d+\\.[a-zA-Z]+$`);

  const files = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .sort();

  let counter = 1;

  for (const file of files) {
    if (pattern.test(file)) {
      console.log(`skip  ${dir}/${file}`);
      counter++;
      continue;
    }

    const ext = path.extname(file);
    const newName = `${dir}_${counter}${ext}`;
    const oldPath = path.join(dirPath, file);
    const newPath = path.join(dirPath, newName);

    fs.renameSync(oldPath, newPath);
    console.log(`rename ${dir}/${file} → ${newName}`);
    counter++;
  }
}
