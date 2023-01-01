import { yellow } from "kolorist";
import fs from "node:fs";
import {
	SUPPORT_CONFIG_KEYS,
	SUPPORT_LINTER,
	SUPPORT_WLINTRC_KEYS,
} from "../constants";
import { boom } from "../error";
import { __DEV__ } from "./config";
import { parseConfigKeys, transformValue } from "./others";
import { wlintConfig } from "./wlintrc";

export function isKeySupported(_keys: string[], key: string) {
	const keys = parseConfigKeys(_keys);
	return keys.some((k) => k.key === key);
}

export function isKeyValid(_keys: string[], key: string, value: any) {
	const keys = parseConfigKeys(_keys);
	const k = keys.find((k) => k.key === key);
	if (!k) return false; // if key is not exist in SUPPORT_CONFIG_KEYS
	const type = k.type;
	if (k.optional && !value) return true;
	if (typeof transformValue(value) !== type) return false;
	return true;
}

// only for origin and alias method
export function validateType(_: string[]) {
	if (!(_[1] === "add" || _[1] === "remove")) {
		boom(`You have not entered a action: add|remove`);
	}
}

// only for config method
export function validateConfigType(_: string[] | undefined) {
	if (
		!_ ||
		!(
			_[1] === "set" ||
			_[1] === "get" ||
			_[1] === "remove" ||
			_[1] === "list"
		)
	) {
		boom(`You have not entered a action: set|get|remove|list`);
		return;
	}
	if (_[1] !== "list" && !_[2]) {
		boom(`You have not entered a key`);
	}
	if (_[1] !== "list" && !isKeySupported(SUPPORT_CONFIG_KEYS, _[2])) {
		boom(`Invalid key, supported keys: ${SUPPORT_CONFIG_KEYS.join(", ")}`);
	}
	if (
		_[1] !== "list" &&
		_[1] !== "get" &&
		!isKeyValid(SUPPORT_CONFIG_KEYS, _[2], _[3])
	) {
		boom(`Invalid value for key ${_[2]}`);
	}
}

export function validateConfigConflict() {
	for (const linter of SUPPORT_LINTER) {
		const file = `.${linter.replace(".json", "")}rc`;
		const files = fs.readdirSync("./");
		const isConflict = files.some((f) => f.includes(file));
		if (isConflict && !__DEV__) {
			boom(
				`Please solve ${linter.replace(
					".json",
					""
				)} config conflict: ${yellow(file)} is already exist`
			);
		}
	}
}

/**
 * Validate wlintrc file
 */
export function validateWlintRc() {
	const file = wlintConfig;
	Object.keys(file).forEach((key) => {
		if (!isKeySupported(SUPPORT_WLINTRC_KEYS, key)) {
			console.warn(`${yellow("⚠️")} Invalid key: ${key}`);
			return; // if key is not exist in SUPPORT_WLINTRC_KEYS, should not validate value
		}
		if (!isKeyValid(SUPPORT_WLINTRC_KEYS, key, file[key])) {
			boom(`Invalid value for key ${key}`);
		}
	});
}
