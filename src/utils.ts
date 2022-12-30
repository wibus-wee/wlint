import fs from "node:fs";
import { CONFIG } from "./constants";
import { GitHubFiles, InpmPackages, NPMFiles } from "./types";
import https from "node:https";

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
export function parseNpmPackages(json: string) {
	console.log(json);
	const parsed = JSON.parse(JSON.stringify(json));
	const npmPackages = [
		...(parsed.extends?.filter((plugin: string) => isNpmPackage(plugin)) ||
			[]), // eslint and prettier(extends)
		...(parsed.plugins?.filter((plugin: string) => isNpmPackage(plugin)) ||
			[]), // eslint
		...(parsed.parser || []), // eslint(only one, @typescript-eslint/parser)
	];
	if (json.includes("@typescript-eslint")) {
		npmPackages.push(["@typescript-eslint/eslint-plugin"]);
	}
	console.log(npmPackages);
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
	${
		pkgs?.map((pkg) => {
			return `...require("${pkg}"),`;
		}) || ""
	}
	${Object.keys(jsons).map((key) => {
		return `${key}: ${JSON.stringify(jsons[key])},`;
	})}
};
`;
	fs.writeFileSync(`./.prettierrc.js`, prettierrc.replace(/^\s+/, ""));
}

export function generateLinterRcFile(
	linter: string,
	json: string,
	pkgs?: InpmPackages[]
) {
	if (linter === "prettier.json") {
		// @ts-ignore
		generatePreittierrcFile(
			json,
			pkgs.filter((pkg) => pkg.linter === "prettier.json")
		);
		return;
	}

	fs.writeFileSync(`./.${linter.replace(".json", "")}rc`, json);
}
