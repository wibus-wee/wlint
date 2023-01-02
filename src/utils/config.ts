import fs from "node:fs";
import { CONFIG } from "../constants";
import { prettyStringify } from "./generator";

export const __DEV__ = process.env.NODE_ENV === "development";

export function getConfigFile() {
  // Auto create wlint config file
  try {
    const file = fs.readFileSync(CONFIG, "utf8").toString();
    if (!file) {
      throw new Error("Config file is empty");
    }
    return file;
  } catch {
    fs.writeFileSync(CONFIG, prettyStringify({ alias: [] }));
    return fs.readFileSync(CONFIG, "utf8").toString();
  }
}

export function setConfig(key: string, value: string) {
  const file = JSON.parse(getConfigFile());
  file[key] = value;
  fs.writeFileSync(CONFIG, prettyStringify(file));
}

export const userConfig = JSON.parse(getConfigFile());
