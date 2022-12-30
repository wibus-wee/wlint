import fs from "node:fs";
import { CONFIG } from "./constants";

export function getShell() {
	const { env } = process;
	// eslint-disable-next-line no-prototype-builtins
	const shell = env[env.hasOwnProperty("ZSH_NAME") ? "ZSH_NAME" : "SHELL"];
	return shell.split("/").pop();
}

export function getConfigFile() {
	// Auto create wlint config file
	try {
		const file = fs.readFileSync(CONFIG, "utf8").toString();
		if (!file) throw new Error("File is empty");
		return file;
	} catch {
		fs.writeFileSync(CONFIG, JSON.stringify({ alias: [] }));
		return fs.readFileSync(CONFIG, "utf8").toString();
	}
}

export const __DEV__ = process.env.NODE_ENV === "development";

export const configFile = JSON.parse(getConfigFile());

export function getUserHome() {
	return process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
}
