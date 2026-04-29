// src/services/useReastockDb.js
import { useEffect, useState } from "react";
import { dbLoad, subscribeDb } from "./storageDb";

export function useReastockDb() {
  const [db, setDb] = useState(() => dbLoad());

  useEffect(() => {
    // pakai helper subscribeDb supaya konsisten
    const unsub = subscribeDb((next) => setDb(next));
    return () => unsub();
  }, []);

  return db;
}
