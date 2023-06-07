import fs from "node:fs";
import { CONFIG, WLINT } from "../constants";
import { prettyStringify } from "./generator";
import { __DEV__ } from "./env";

export function getConfigFile() {
  // Auto create wlint config file
  if (__DEV__) {
    // check if temp folder exists
    if (!fs.existsSync(WLINT)) {
      fs.mkdirSync(WLINT);
    }
  }
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
