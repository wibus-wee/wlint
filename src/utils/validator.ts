import { cyan, yellow } from "kolorist";
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
	let res = false;
	const keys = parseConfigKeys(_keys);
	const k = keys.find((k) => k.key === key);
	if (!k) return false; // if key is not exist in SUPPORT_CONFIG_KEYS
	if (k.optional && !value) return true;

	if (k.type.split("|").length > 1) {
		// if type is union
		const types = k.type.split("|");
		res = types.some((t) => typeof transformValue(value) === t); // check if value is type
	} else if (k.type.split("[]").length > 1) {
		// if type is array
		if (!Array.isArray(value)) return false; // if value is not array
		const type = k.type.split("[]")[0]; // get type of array
		res = value.every((v) => typeof transformValue(v) === type); // check if every value is type
	} else {
		res = typeof transformValue(value) === k.type; // check if value is type
	}

	return res;
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
	if (!file) return;
	Object.keys(file).forEach((key) => {
		if (!isKeySupported(SUPPORT_WLINTRC_KEYS, key)) {
			console.warn(
				`${yellow("⚠")} Found unsupported key in .wlintrc: ${cyan(key)}`
			);
			return; // if key is not exist in SUPPORT_WLINTRC_KEYS, should not validate value
		}
		if (!isKeyValid(SUPPORT_WLINTRC_KEYS, key, file[key])) {
			boom(`Invalid value for key ${cyan(key)}: ${file[key]}`);
		}
	});
}
