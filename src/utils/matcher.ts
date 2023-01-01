import { yellow, blue } from "kolorist";
import path from "node:path";
import fs from "node:fs";
import { AUTO_MATCH } from "../constants";
import { boom } from "../error";
import { userConfig } from "./config";

export function autoMatcher(autoMatchConfig?: {
	[key: string]: string[] | string;
}) {
	if (!userConfig?.autoMatch) {
		return undefined;
	}
	if (!fs.existsSync(path.resolve(process.cwd(), "package.json"))) {
		boom(`Please run this command in a project folder`);
	}
	const packages = require(path.resolve(process.cwd(), "package.json"));
	let dependencies: string[] = [];
	if (packages.dependencies) {
		// 只需要名字
		dependencies = Object.keys(packages.dependencies);
	}
	if (packages.devDependencies) {
		dependencies = dependencies.concat(
			Object.keys(packages.devDependencies)
		);
	}

	const auto_match = AUTO_MATCH;

	function removeValueFromAutoMatch(value: string) {
		for (const k in auto_match) {
			if (k in auto_match) {
				const val = auto_match[k];
				if (Array.isArray(val)) {
					if (val.includes(value)) {
						auto_match[k] = val.filter((i: string) => i !== value);
					}
				}
			}
		}
	}

	for (const key in autoMatchConfig) {
		if (key in autoMatchConfig) {
			const value = autoMatchConfig[key];
			if (Array.isArray(value)) {
				value.forEach((v) => removeValueFromAutoMatch(v));
			} else if (typeof value === "string") {
				removeValueFromAutoMatch(value);
			}
		}
	}

	// merge autoMatchConfig and AUTO_MATCH, if there are duplicate keys, use autoMatchConfig
	const autoMatch = Object.assign({}, auto_match, autoMatchConfig);
	const autoMatchKeys = new Set(Object.keys(autoMatch));
	const matchers: string[] = [];
	for (const key of autoMatchKeys) {
		const value = autoMatch[key];
		if (Array.isArray(value)) {
			const match = dependencies.filter((dep) => value.includes(dep));
			if (match.length) {
				matchers.push(key);
			}
		}
		if (typeof value === "string") {
			if (dependencies.includes(value)) {
				matchers.push(key);
			}
		}
	}
	if (matchers.length > 1) {
		boom(`Auto match category conflict: ${yellow(matchers.join(", "))}`);
	}
	if (matchers.length) {
		console.log(
			`${blue("ℹ")} Auto match ${yellow(matchers.join(""))} category`
		);
	}
	return matchers.join("");
}
