import spawn from "cross-spawn";
import { blue, green } from "kolorist";
import { IGNORE_DIRS, SUPPORT_LINTER } from "../constants";
import { boom } from "../error";
import {
	getGitHubFile,
	getGitHubFiles,
	getNpmPackageFile,
	getNpmPackageFiles,
	getNpmPackageInfo,
} from "../request";
import { InpmPackages, NPMFiles } from "../types";
import {
	detectPkgManage,
	generateLinterRcFile,
	getWlintConfig,
	hasWlintConfig,
	isNpmPackage,
	parseNpmPackages,
	setWlintConfig,
	wlintConfig,
	__DEV__,
} from "../utils";

export async function update() {
	if (!hasWlintConfig()) {
		boom("No wlint config file found. Please run `wlint` first.");
	}
	const config = getWlintConfig();
	const origin: string = config.origin;
	const category: string | undefined = config.category;
	const aliases: object | undefined = config.aliases;
	const isNpm = isNpmPackage(origin);
	const packageManager = detectPkgManage();
	let categories: Array<string> = [];
	let fileList: Array<string> = [];
	let cache: NPMFiles;
	console.log(`${blue(`ℹ`)} Updating your linter config...`);

	if (isNpm) {
		const latest = (await getNpmPackageInfo(origin))["dist-tags"].latest;
		if (!latest) {
			boom(`Can't get latest version of ${origin}`);
		}
		const list = await getNpmPackageFiles(origin, latest);
		cache = list;

		Object.keys(list.files).forEach((key) => {
			if (category) {
				// if category is defined, only get files from that category
				if (!key?.match(/\//g)?.length) {
					categories.push(key);
				}
				if (key?.match(/\//g)?.length === 2) {
					const category = key.split("/")[0];
					if (!categories.includes(category)) {
						categories.push(category);
					}
				}
				const data = list.files;
				Object.keys(data).forEach((key) => {
					if (key.match(/\//g)?.length === 2) {
						const _category = key.split("/")[0];
						if (_category === category) {
							const file = key.split("/")[1];
							fileList.push(file); // push category file to fileList
						}
					}
				});
			}
			if (key === "config.json") {
				fileList.push(key);
			}
		});

		if (categories.length === 0 && !category) {
			Object.keys(list.files).forEach((key) => {
				const file = key.split("/")[1];
				fileList.push(file);
			});
		}
	} else {
		const list = await getGitHubFiles(origin);
		list.forEach((file) => {
			if (file.type === "dir" && category) {
				categories.push(file.name);
			}
			if (file.type === "file" || file.name === "config.json") {
				fileList.push(file.name);
			}
		});

		if (categories.length === 0 && !category) {
			list.forEach((file) => {
				if (file.type === "file") {
					fileList.push(file.name);
				}
			});
		}

		if (category) {
			const _list = await getGitHubFiles(origin, category);
			_list.forEach((file) => {
				if (file.type === "file" && file.path.includes(category)) {
					fileList.push(file.name);
				}
			});
		}
	}

	if (category) {
		categories = categories.filter((category) => !category.includes("."));
		categories = categories.filter(
			(category) => !IGNORE_DIRS.includes(category)
		);
	}

	fileList = fileList.filter(
		(file) => SUPPORT_LINTER.includes(file) || file === "config.json"
	);

	console.log(`${blue("ℹ")} Scaning wlint repo config...`);
	let repoConfig: any;
	if (fileList.includes("config.json")) {
		const id = cache!.files[`config.json`].hex;
		if (isNpm) {
			repoConfig = await getNpmPackageFile(origin, id);
		} else {
			repoConfig = await getGitHubFile(origin, `config.json`);
		}
		repoConfig = JSON.parse(repoConfig);
	}

	const originalNpmPackages = new Array<InpmPackages>(); // 原始的包
	const npmPackages = new Array<InpmPackages>(); // 需要安装的包

	let data: object = {};

	for (const linter of SUPPORT_LINTER) {
		console.log(`${blue("ℹ")} Configuring ${linter}...`);
		if (fileList.includes(`${linter}`)) {
			const aliases = repoConfig?.aliases || {};
			const path = `${category ? `${category}/` : ""}${linter}`;
			if (isNpm) {
				const fileId = cache!.files[path].hex;
				data = await getNpmPackageFile(origin, fileId);
			} else {
				console.log(
					`${blue("ℹ")} Generating .${linter.replace(
						".json",
						""
					)}rc...`
				);
				data = await getGitHubFile(origin, path);
			}
			generateLinterRcFile(linter, JSON.stringify(data), npmPackages);
			console.log(
				`${green("✔")} .${linter.replace(".json", "")}rc generated`
			);
			npmPackages.push({
				linter,
				packages: parseNpmPackages(
					linter,
					JSON.stringify(data),
					aliases
				),
			});
			console.log(
				`${green("✔")} ${linter.replace(
					".json",
					""
				)} npm packages recorded`
			);
		}
	}

	console.log(`${blue("ℹ")} Comparing npm packages...`);
	const _npmPackages = new Array<string>();
	const _installNpmPackages = new Array<string>();
	const _deleteNpmPackages = new Array<string>();

	npmPackages.forEach((item) => {
		item.packages.forEach((item) => {
			_npmPackages.push(item);
		});
	});

	wlintConfig.packages.forEach((item) => {
		if (!_npmPackages.includes(item)) {
			_deleteNpmPackages.push(item);
		}
	});

	_npmPackages.forEach((item) => {
		if (!wlintConfig.packages.includes(item)) {
			_installNpmPackages.push(item);
		}
	});

	if (!packageManager) {
		boom(
			`packageManager is undefined, please create an issue in https://github.com/wibus-wee/wlint/issues`
		);
		return;
	}

	if (_installNpmPackages.length > 0) {
		console.log(
			`${blue(
				"ℹ"
			)} Installing new npm packages: ${_installNpmPackages.join(", ")}`
		);
		console.log(
			`${blue("ℹ")} ${packageManager} add -D ${_installNpmPackages.join(
				" "
			)}`
		);
		!__DEV__ &&
			spawn.sync(packageManager, [
				"add",
				"-D",
				_installNpmPackages.join(" "),
			]);
		console.log(`${green("✔")} New npm packages installed`);
	}

	if (_deleteNpmPackages.length > 0) {
		console.log(
			`${blue("ℹ")} Removing old npm packages: ${_deleteNpmPackages.join(
				", "
			)}`
		);
		console.log(
			`${blue("ℹ")} ${packageManager} remove -D ${_deleteNpmPackages.join(
				" "
			)}`
		);
		!__DEV__ &&
			spawn.sync(packageManager, [
				"uninstall",
				_deleteNpmPackages.join(" "),
			]);
		console.log(`${green("✔")} Old npm packages removed`);
	}

	if (_installNpmPackages.length === 0 && _deleteNpmPackages.length === 0) {
		console.log(
			`${blue("ℹ")} No npm packages need to be installed or removed`
		);
	}

	let _packages = new Array<string>();
	// 除了install和delete，还有可能是update
	npmPackages.forEach((item) => {
		item.packages.forEach((item) => {
			_packages.push(item);
		});
	});

	_packages = _packages.filter((item) => {
		return (
			!_installNpmPackages.includes(item) &&
			!_deleteNpmPackages.includes(item)
		);
	}); // 去重, 保证不会重复安装

	if (_packages.length > 0) {
		console.log(
			`${blue("ℹ")} Updating npm packages: ${_packages.join(", ")}`
		);
		console.log(
			`${blue("ℹ")} ${packageManager} update ${_packages.join(" ")}`
		);
		!__DEV__ && spawn.sync(packageManager, ["update", _packages.join(" ")]);
		console.log(`${green("✔")} All packages updated`);
	}

	console.log(`${green("✔")} Update completed`);

	setWlintConfig("aliases", repoConfig?.aliases || {});
	console.log(`${green("✔")} .wlintrc updated`);
}
