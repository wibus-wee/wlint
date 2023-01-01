import fs from "node:fs";
import { CONFIG, SUPPORT_CONFIG_KEYS } from "../constants";
import { transformValue } from "./others";

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
		fs.writeFileSync(CONFIG, JSON.stringify({ alias: [] }));
		return fs.readFileSync(CONFIG, "utf8").toString();
	}
}

export function setConfig(key: string, value: string) {
	const file = JSON.parse(getConfigFile());
	file[key] = value;
	fs.writeFileSync(CONFIG, JSON.stringify(file));
}

export const userConfig = JSON.parse(getConfigFile());

export function getConfigKeys() {
	const keys = SUPPORT_CONFIG_KEYS;
	const configKeys = keys.map((key) => {
		const [k, t] = key.split(":");
		return {
			key: k.replace("?", ""),
			type: t,
			optional: k.includes("?"),
		};
	});
	return configKeys;
}

export function isKeySupported(key: string) {
	const keys = getConfigKeys();
	return keys.some((k) => k.key === key);
}

export function isKeyValid(key: string, value: any) {
	const keys = getConfigKeys();
	const k = keys.find((k) => k.key === key);
	if (!k) return false; // if key is not exist in SUPPORT_CONFIG_KEYS
	const type = k.type;
	if (k.optional && !value) return true;
	if (typeof transformValue(value) !== type) return false;
	return true;
}
