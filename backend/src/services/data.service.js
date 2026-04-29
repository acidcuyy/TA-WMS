import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "../data/db.json");

export const readDB = async () => {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB:", error);
    return null;
  }
};

export const writeDB = async (data) => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing DB:", error);
    return false;
  }
};

export const getCollection = async (collectionName) => {
  const db = await readDB();
  return db ? db[collectionName] : [];
};

export const updateCollection = async (collectionName, newData) => {
  const db = await readDB();
  if (db) {
    db[collectionName] = newData;
    return await writeDB(db);
  }
  return false;
};
