import fs from "node:fs";

export function getWlintConfig() {
	try {
		const config = JSON.parse(fs.readFileSync(".wlintrc", "utf-8"));
		return config;
	} catch {
		return {};
	}
}

export function hasWlintConfig() {
	return fs.existsSync("./.wlintrc");
}

export const wlintConfig = getWlintConfig();

export function setWlintConfig(key: string, value: any) {
	const config = getWlintConfig();
	config[key] = value;
	fs.writeFileSync(".wlintrc", JSON.stringify(config));
}
