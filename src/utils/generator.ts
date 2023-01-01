import fs from "node:fs";

export function generatePrettierrcFile(json: string) {
	const jsons = JSON.parse(json);
	const extend = jsons.extends;
	delete jsons.extends;
	const keys = Object.keys(jsons);
	const prettierrc = `
module.exports = {
	${
		extend?.map((pkg) => {
			return `...require("${pkg}"),`;
		}) || ""
	}
	${keys.map((key, index) => {
		return `${key}: ${JSON.stringify(jsons[key])}${
			index === keys.length - 1 ? "" : ","
		}`;
	})}
};
`;
	fs.writeFileSync("./.prettierrc.js", prettierrc.replace(/^\n/, ""));
}

export function generateLinterRcFile(linter: string, json: string) {
	if (linter === "prettier.json") {
		generatePrettierrcFile(json);
		return;
	}
	fs.writeFileSync(`./.${linter.replace(".json", "")}rc.json`, json, {
		encoding: "utf-8",
	});
}
