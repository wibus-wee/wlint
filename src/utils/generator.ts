import fs from "node:fs";
import { InpmPackages } from "../types";

export function generatePrettierrcFile(json: string, npmPkgs?: InpmPackages) {
	const pkgs = npmPkgs?.packages;
	const jsons = JSON.parse(json);
	const keys = Object.keys(jsons);
	const prettierrc = `
module.exports = {
	${keys.map((key, index) => {
		return `${key}: ${JSON.stringify(jsons[key])}${
			index === keys.length - 1 ? "" : ","
		}`;
	})}
	${
		pkgs?.map((pkg) => {
			return `...require("${pkg}"),`;
		}) || ""
	}
};
`;
	const prettierrcStr = prettierrc.replace(/(\r)?\n/g, "");
	fs.writeFileSync("./.prettierrc.js", prettierrcStr);
}

export function generateLinterRcFile(
	linter: string,
	json: string,
	pkgs: InpmPackages[]
) {
	if (linter === "prettier.json") {
		generatePrettierrcFile(
			json,
			// @ts-ignore : the length is always 1 after filter
			pkgs.filter((pkg) => pkg.linter === "prettier.json")
		);
		return;
	}
	fs.writeFileSync(`./.${linter.replace(".json", "")}rc.json`, json, {
		encoding: "utf-8",
	});
}
