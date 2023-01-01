import fs from "node:fs";
import { InpmPackages } from "../types";

export function generatePreittierrcFile(json: string, npmPkgs?: InpmPackages) {
	const pkgs = npmPkgs?.packages;
	const jsons = JSON.parse(json);
	const prettierrc = `
module.exports = {
	${Object.keys(jsons).map((key) => {
		return `${key}: ${JSON.stringify(jsons[key])},`;
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
	pkgs?: InpmPackages[]
) {
	if (linter === "prettier.json") {
		generatePreittierrcFile(
			json,
			// @ts-ignore
			pkgs.filter((pkg) => pkg.linter === "prettier.json")
		);
		return;
	}

	fs.writeFileSync(`./.${linter.replace(".json", "")}rc.json`, json);
}
