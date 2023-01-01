import { yellow } from "kolorist";
import fs from "node:fs";
import { SUPPORT_CONFIG_KEYS, SUPPORT_LINTER } from "../constants";
import { boom } from "../error";
import { isKeySupported, isKeyValid, __DEV__ } from "./config";

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
	if (_[1] !== "list" && !isKeySupported(_[2])) {
		boom(`Invalid key, supported keys: ${SUPPORT_CONFIG_KEYS.join(", ")}`);
	}
	if (_[1] !== "list" && _[1] !== "get" && !isKeyValid(_[2], _[3])) {
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
