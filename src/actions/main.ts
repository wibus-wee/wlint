import fs from "node:fs";
import { blue, green, red } from "kolorist";
import prompts from "prompts";
import { ORIGINAL, SUPPORT_LINTER } from "../constants";
import { Iminimist, InpmPackages, NPMFiles } from "../types";
import {
	checkConflict,
	configFile,
	generateLinterRcFile,
	getGitHubFile,
	getGitHubFiles,
	getNpmPackageFile,
	getNpmPackageFiles,
	getNpmPackageInfo,
	isNpmPackage,
	parseNpmPackages,
	setConfig,
} from "../utils";
import spawn from "cross-spawn";

export const main = async (argv: Iminimist) => {
	checkConflict();

	const config = configFile;
	const packageManager = config.packageManager;
	// 这个要留给 用户 去选择要用谁的，如果只有一个的话就其实不需要选择了
	const configOriginals = config.originals?.length
		? config.originals
		: argv.original
		? [argv.original]
		: [ORIGINAL];
	const category = argv.category || argv.c || undefined; // 使用的是哪个分类下的配置，如果没有指定的话有两个情况，一个是直接写根目录了全都的配置，这个时候就不需要继续进入文件夹了，一个是只有default分类，那这个情况就用default分类

	const packageManagerSetting = await prompts(
		[
			{
				type: packageManager ? null : "select",
				name: "packageManager",
				message: "Which package manager do you want to use?",
				choices: [
					{ title: "npm", value: "npm" },
					{ title: "yarn", value: "yarn" },
					{ title: "pnpm", value: "pnpm" },
				],
				initial: 0,
			},
		],
		{
			onCancel: () => {
				console.log(`${red("✖")} Operation cancelled`);
				process.exit(0);
			},
		}
	);

	if (!packageManager) {
		setConfig("packageManager", packageManagerSetting.packageManager);
	}

	const res = await prompts(
		[
			{
				type: configOriginals.length > 1 ? "select" : null,
				name: "original",
				message: "Which original do you want to use?",
				choices: configOriginals.map((original) => ({
					title: original,
					value: original,
				})),
			},
		],
		{
			onCancel: () => {
				console.log(`${red("✖")} Operation cancelled`);
				process.exit(0);
			},
		}
	);

	const original = res.original || configOriginals[0];
	const isNpm = isNpmPackage(original);
	const categories: Array<string> = [];
	let fileList: Array<string> = [];
	let cache: NPMFiles;
	if (isNpm) {
		const latest = getNpmPackageInfo(original)?.["dist-tags"]?.latest;
		if (!latest) {
			throw new Error(`${red("✖")} Package not found`);
		}
		const list = await getNpmPackageFiles(original, latest);
		cache = list;

		Object.keys(list.files).forEach((key) => {
			if (!key?.match(/\//g)?.length) {
				categories.push(key);
			}
			if (key?.match(/\//g)?.length === 2) {
				const category = key.split("/")[0];
				if (!categories.includes(category)) {
					categories.push(category);
				}
			}
		});

		if (categories.length === 0) {
			Object.keys(list.files).forEach((key) => {
				const file = key.split("/")[1];
				fileList.push(file);
			});
			fileList = fileList.filter(
				(file) => !SUPPORT_LINTER.includes(file)
			);
		}
	} else {
		const list = await getGitHubFiles(original);
		list.forEach((file) => {
			if (file.type === "dir") {
				categories.push(file.name);
			}
		});

		if (categories.length === 0) {
			list.forEach((file) => {
				if (file.type === "file") {
					fileList.push(file.name);
				}
			});
			fileList = fileList.filter(
				(file) => !SUPPORT_LINTER.includes(file)
			);
		}
	}

	// console.log(blue("ℹ"), "Categories:", categories.join(", "));
	// console.log(blue("ℹ"), "Files:", fileList.join(", "));

	const selectFileList = await prompts(
		[
			{
				type: categories.length > 0 && !category ? "select" : null,
				name: "category",
				message: "Which category do you want to use?",
				choices: categories.map((category) => ({
					title: category,
					value: category,
				})),
			},
		],
		{
			onCancel: () => {
				console.log(`${red("✖")} Operation cancelled`);
				process.exit(0);
			},
		}
	);

	const selectCategory = selectFileList.category || category;

	console.log(blue("ℹ"), "Project Category:", selectCategory);

	if (isNpm) {
		const data = cache!.files;
		Object.keys(data).forEach((key) => {
			if (key.match(/\//g)?.length === 2) {
				const category = key.split("/")[0];
				if (category === selectCategory) {
					const file = key.split("/")[1];
					fileList.push(file);
				}
			}
		});
	} else {
		const list = await getGitHubFiles(original, selectCategory);
		list.forEach((file) => {
			if (file.type === "file" && file.path.includes(selectCategory)) {
				fileList.push(file.name);
			}
		});
	}
	fileList = fileList.filter((file) => SUPPORT_LINTER.includes(file));

	const npmPackages = new Array<InpmPackages>(); // 需要安装的包

	console.log(`${blue("ℹ")} Configuring linter...`);

	let data = "";

	for (const linter of SUPPORT_LINTER) {
		if (selectCategory) {
			console.log(`${blue("ℹ")} Configuring ${linter}...`);
			if (fileList.includes(`${linter}`)) {
				let alias = "";
				const path = `${selectCategory}/${linter}`;
				if (isNpm) {
					const fileId = cache!.files[path].hex;
					data = await getNpmPackageFile(original, fileId);
				} else {
					data = await getGitHubFile(original, path);
				}
				if (fileList.includes("alias.json")) {
					// 只考虑根目录下配置的 alias
					const id = cache!.files[`alias.json`].hex;
					if (isNpm) {
						alias = await getNpmPackageFile(original, id);
					} else {
						alias = await getGitHubFile(
							original,
							`${selectCategory}/alias.json`
						);
					}
				}
				console.log(
					`${blue("ℹ")} Generating .${linter.replace(
						".json",
						""
					)}rc...`
				);
				generateLinterRcFile(linter, data, npmPackages);
				npmPackages.push({
					linter,
					packages: parseNpmPackages(data, alias),
				});
				console.log(`${green("✔")} .${linter}rc generated`);
				console.log(`${green("✔")} npmPackages recorded:`, npmPackages);
			}
		}
	}

	console.log(`${blue("ℹ")} Installing linter dependencies...`);
	try {
		fs.readFileSync("package.json");
	} catch (e) {
		console.log(`${red("✖")} package.json not found`);
		process.exit(1);
	}

	console.log(
		`${blue("ℹ")} ${packageManager} add -D ${npmPackages
			.map((item) => item.packages.join(" "))
			.join("")}`
	);
	spawn.sync(
		packageManager,
		[
			"add",
			"-D",
			npmPackages.map((item) => item.packages.join(" ")).join(""),
		],
		{ stdio: "inherit" }
	);

	console.log(`${green("✔")} Linter dependencies installed`);
};