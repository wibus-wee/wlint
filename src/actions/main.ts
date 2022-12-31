import fs from "node:fs";
import { blue, green, red, yellow } from "kolorist";
import prompts from "prompts";
import { ORIGINAL, SUPPORT_LINTER } from "../constants";
import { Iminimist, InpmPackages, NPMFiles } from "../types";
import {
	autoMatcher,
	checkConflict,
	configFile,
	detectPkgManage,
	generateLinterRcFile,
	getGitHubFile,
	getGitHubFiles,
	getNpmPackageFile,
	getNpmPackageFiles,
	getNpmPackageInfo,
	isNpmPackage,
	parseNpmPackages,
} from "../utils";
import spawn from "cross-spawn";

export const main = async (argv: Iminimist) => {
	checkConflict();

	const config = configFile;
	let packageManager = detectPkgManage();
	// 这个要留给 用户 去选择要用谁的，如果只有一个的话就其实不需要选择了
	const configOriginals = config.originals?.length
		? config.originals
		: argv.original
		? [argv.original]
		: [ORIGINAL];
	let category = autoMatcher() || argv.category || argv.c || undefined; // 使用的是哪个分类下的配置，如果没有指定的话有两个情况，一个是直接写根目录了全都的配置，这个时候就不需要继续进入文件夹了，一个是只有default分类，那这个情况就用default分类

	if (!fs.existsSync("package.json")) {
		console.log(
			`${red(
				"✖"
			)} package.json not found, are you in the project root directory?`
		);
		process.exit(1);
	}

	if (!packageManager) {
		console.log(`${blue("✖")} Can't detect package manager.`);
		const res = await prompts(
			{
				type: "select",
				name: "packageManager",
				message: `${blue(
					"✖"
				)} Can't detect package manager. Please select one:`,
				choices: [
					{ title: "npm", value: "npm" },
					{ title: "yarn", value: "yarn" },
					{ title: "pnpm", value: "pnpm" },
				],
			},
			{
				onCancel: () => {
					console.log(`${red("✖")} Operation cancelled`);
					process.exit(0);
				},
			}
		);
		packageManager = res.packageManager;
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

	if (category && !categories.includes(category)) {
		console.log(
			`${yellow(
				"⚠"
			)} Auto match category ${category} not found, turn to select`
		);
		category = undefined; // reset category
	}

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

	console.log(`${blue("ℹ")} Scaning wlint repo config...`);

	let wlintConfig: any;
	if (fileList.includes("config.json")) {
		// 只考虑根目录下配置的 alias
		const id = cache!.files[`config.json`].hex;
		if (isNpm) {
			wlintConfig = await getNpmPackageFile(original, id);
		} else {
			wlintConfig = await getGitHubFile(
				original,
				`${selectCategory}/alias.json`
			);
		}
		wlintConfig = JSON.parse(wlintConfig);
	}

	const npmPackages = new Array<InpmPackages>(); // 需要安装的包

	console.log(`${blue("ℹ")} Configuring linter...`);

	let data = "";

	for (const linter of SUPPORT_LINTER) {
		if (selectCategory) {
			console.log(`${blue("ℹ")} Configuring ${linter}...`);
			if (fileList.includes(`${linter}`)) {
				const aliases = wlintConfig?.aliases || {};
				const path = `${selectCategory}/${linter}`;
				if (isNpm) {
					const fileId = cache!.files[path].hex;
					data = await getNpmPackageFile(original, fileId);
				} else {
					data = await getGitHubFile(original, path);
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
					packages: parseNpmPackages(data, aliases),
				});
				console.log(`${green("✔")} .${linter}rc generated`);
				console.log(`${green("✔")} npmPackages recorded:`, npmPackages);
			}
		}
	}

	console.log(`${blue("ℹ")} Installing linter dependencies...`);

	if (!packageManager)
		throw new Error(
			"packageManager is undefined, please create an issue in https://github.com/wibus-wee/wlint/issues"
		);
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
