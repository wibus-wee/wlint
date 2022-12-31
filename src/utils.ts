import fs from "node:fs";
import {
	AUTO_MATCH,
	CONFIG,
	SUPPORT_CONFIG_KEYS,
	SUPPORT_LINTER,
} from "./constants";
import { GitHubFiles, InpmPackages, NPMFiles } from "./types";
import https from "node:https";
import path from "node:path";
import { cyan, red, yellow } from "kolorist";

// only for origin and alias method
export function isValidateType(_: string[] | undefined) {
	if (!_ || !(_[1] === "add" || _[1] === "remove")) {
		console.log(`${red("✖")} Invalid type`);
		process.exit(1);
	}
}

// only for config method
export function isValidateConfigType(_: string[] | undefined) {
	if (
		!_ ||
		!(
			_[1] === "set" ||
			_[1] === "get" ||
			_[1] === "remove" ||
			_[1] === "list"
		)
	) {
		console.log(
			`${red("✖")} You have not entered a action: set|get|remove|list`
		);
		process.exit(1);
	}
	if (_[1] !== "list" && !_[2]) {
		console.log(`${red("✖")} You have not entered a key`);
		process.exit(1);
	}
	if (_[1] !== "list" && !isKeySupported(_[2])) {
		console.log(
			`${red(
				"✖"
			)} Invalid key, supported keys: ${SUPPORT_CONFIG_KEYS.join(", ")}`
		);
		process.exit(1);
	}
	if (_[1] !== "list" && _[1] !== "get" && !isKeyValid(_[2], _[3])) {
		console.log(`${red("✖")} Invalid value type `);
		process.exit(1);
	}
}

export function getShell(): string {
	const { env } = process;
	const path = "ZSH_NAME" in env ? "ZSH_NAME" : "SHELL";
	const shell = env[path];
	if (!shell) {
		throw new Error("Can' get shell name.");
	}
	return shell.split("/").pop()!;
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

export function setConfig(key: string, value: string) {
	const file = JSON.parse(getConfigFile());
	file[key] = value;
	fs.writeFileSync(CONFIG, JSON.stringify(file));
}

export const __DEV__ = process.env.NODE_ENV === "development";

export const configFile = JSON.parse(getConfigFile());

export function getUserHome() {
	return process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
}

export function isNpmPackage(name: string) {
	return (
		(name.startsWith("@") && name.includes("/")) ||
		(!name.startsWith("@") && !name.includes("/"))
	);
}

// parse npm packages from eslint and prettier config file to install
export function parseNpmPackages(json: string, alias: string) {
	const parsed = JSON.parse(JSON.stringify(json));
	const aliases = JSON.parse(alias);
	const npmPackages = [
		...(parsed.extends?.filter((plugin: string) => isNpmPackage(plugin)) ||
			[]), // eslint and prettier(extends)
		...(parsed.plugins?.filter((plugin: string) => isNpmPackage(plugin)) ||
			[]), // eslint
		...(parsed.parser || []), // eslint(only one, @typescript-eslint/parser)
	];
	if (json.includes("@typescript-eslint")) {
		npmPackages.push("@typescript-eslint/eslint-plugin");
	}
	if (aliases) {
		npmPackages.forEach((item: string, index: number) => {
			if (aliases[item]) {
				console.log(
					`${yellow("⚠")} Alias: ${cyan(item)} -> ${cyan(
						aliases[item]
					)}`
				);
				npmPackages[index] = aliases[item];
			}
		});
	}
	return npmPackages;
}

// https://www.npmjs.com/package/{name}/file/{fileId} To get the file details
// https://www.npmjs.com/package/{name}/v/{version}/index To get the file details
// https://registry.npmjs.org/{name} To get the package details, the latest version is in the dist-tags.latest

export function getNpmPackageInfo(name: string) {
	return new Promise((resolve, reject) => {
		https.get(`https://registry.npmjs.org/${name}`, (res: any) => {
			let data = "";
			res.on("data", (chunk: any) => {
				data += chunk;
			});
			res.on("error", (err: any) => {
				reject(err);
			});
			res.on("end", () => {
				resolve(JSON.parse(data));
			});
		});
	});
}

export function getNpmPackageFiles(
	name: string,
	version: string
): Promise<NPMFiles> {
	return new Promise((resolve, reject) => {
		https.get(
			`https://www.npmjs.com/package/${name}/v/${version}/index`,
			(res: any) => {
				let data = "";
				res.on("data", (chunk: any) => {
					data += chunk;
				});
				res.on("error", (err: any) => {
					reject(err);
				});
				res.on("end", () => {
					resolve(JSON.parse(data));
				});
			}
		);
	});
}

export function getNpmPackageFile(
	name: string,
	fileId: string
): Promise<string> {
	return new Promise((resolve, reject) => {
		https.get(
			`https://www.npmjs.com/package/${name}/file/${fileId}`,
			(res: any) => {
				let data = "";
				res.on("data", (chunk: any) => {
					data += chunk;
				});
				res.on("error", (err: any) => {
					reject(err);
				});
				res.on("end", () => {
					resolve(JSON.stringify(data));
				});
			}
		);
	});
}

export function getGitHubFiles(
	repo: string,
	dir?: string
): Promise<GitHubFiles[]> {
	return new Promise((resolve, reject) => {
		https.get(
			{
				hostname: "api.github.com",
				path: `/repos/${repo}/contents${dir ? `/${dir}` : ""}`,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1",
				},
			},
			(res: any) => {
				let data = "";
				res.on("data", (chunk: any) => {
					data += chunk;
				});
				res.on("error", (err: any) => {
					reject(err);
				});
				res.on("end", () => {
					resolve(JSON.parse(data));
				});
			}
		);
	});
}

export function getGitHubFile(repo: string, file: string): Promise<string> {
	return new Promise((resolve, reject) => {
		https.get(
			{
				hostname: "api.github.com",
				path: `/repos/${repo}/contents/${file}`,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1",
				},
			},
			(res: any) => {
				let data = "";
				res.on("data", (chunk: any) => {
					data += chunk;
				});
				res.on("error", (err: any) => {
					reject(err);
				});
				res.on("end", () => {
					const download_url = JSON.parse(data).download_url;
					https.get(
						{
							hostname: "raw.githubusercontent.com",
							path: download_url.split(
								"https://raw.githubusercontent.com"
							)[1],
						},
						(res: any) => {
							let data = "";
							res.on("data", (chunk: any) => {
								data += chunk;
							});
							res.on("error", (err: any) => {
								reject(err);
							});
							res.on("end", () => {
								resolve(data);
							});
						}
					);
				});
			}
		);
	});
}

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

export function detectPkgManage() {
	const cwd = process.cwd();
	const resolve = (file: string) => path.resolve(cwd, file);
	if (fs.existsSync(resolve("yarn.lock"))) return "yarn";
	if (fs.existsSync(resolve("pnpm-lock.yaml"))) return "pnpm";
	if (fs.existsSync(resolve("package-lock.json"))) return "npm";
	return null;
}

export function checkConflict() {
	for (const linter of SUPPORT_LINTER) {
		const file = `.${linter.replace(".json", "")}rc`;
		const files = fs.readdirSync("./");
		const isConflict = files.some((f) => f.includes(file));
		if (isConflict && !__DEV__) {
			console.log(
				`${red("✖")} Please solve ${linter.replace(
					".json",
					""
				)} config conflict: ${yellow(file)} is already exist`
			);
			process.exit(1);
		}
	}
}

export function transformValue(value: any) {
	if (typeof value === "string") {
		try {
			return JSON.parse(value);
		} catch (error) {
			return value;
		}
	}
	return value;
}

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

export function autoMatcher(autoMatchConfig?: {
	[key: string]: string[] | string;
}) {
	if (!fs.existsSync(path.resolve(process.cwd(), "package.json"))) {
		console.log(`${red("✖")} Please run this command in a project folder`);
		process.exit(1);
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
			if (Object.prototype.hasOwnProperty.call(auto_match, k)) {
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
		if (Object.prototype.hasOwnProperty.call(autoMatchConfig, key)) {
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
	return matchers;
}
