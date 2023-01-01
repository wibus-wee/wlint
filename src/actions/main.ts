import fs from "node:fs";
import { blue, green, yellow } from "kolorist";
import prompts from "prompts";
import { ORIGINAL, SUPPORT_LINTER } from "../constants";
import { Iminimist, InpmPackages, NPMFiles } from "../types";
import {
	autoMatcher,
	checkConflict,
	configFile,
	detectPkgManage,
	generateLinterRcFile,
	isNpmPackage,
	parseNpmPackages,
} from "../utils";
import {
	getGitHubFile,
	getGitHubFiles,
	getNpmPackageFile,
	getNpmPackageFiles,
	getNpmPackageInfo,
} from "../request";
import spawn from "cross-spawn";
import { boom, promptsOnCancel } from "src/error";

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

	if (!fs.existsSync("package.json")) {
		boom(`package.json not found, are you in the project root directory?`);
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
				onCancel: promptsOnCancel,
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
			onCancel: promptsOnCancel,
		}
	);

	const original = res.original || configOriginals[0];
	const isNpm = isNpmPackage(original);
	const categories: Array<string> = [];
	let fileList: Array<string> = [];
	let cache: NPMFiles;
	if (isNpm) {
		const latest = (await getNpmPackageInfo(original))["dist-tags"].latest;
		if (!latest) {
			boom(`Can't get latest version of ${original}`);
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
			if (key === "config.json") {
				fileList.push(key);
			}
		});

		if (categories.length === 0) {
			Object.keys(list.files).forEach((key) => {
				const file = key.split("/")[1];
				fileList.push(file);
			});
		}
	} else {
		const list = await getGitHubFiles(original);
		list.forEach((file) => {
			if (file.type === "dir") {
				categories.push(file.name);
			}
			if (file.type === "file" || file.name === "config.json") {
				fileList.push(file.name);
			}
		});

		if (categories.length === 0) {
			list.forEach((file) => {
				if (file.type === "file") {
					fileList.push(file.name);
				}
			});
		}
	}

	fileList = fileList.filter(
		(file) => SUPPORT_LINTER.includes(file) || file === "config.json"
	);

	console.log(`${blue("ℹ")} Scaning wlint repo config...`);
	let wlintConfig: any;
	if (fileList.includes("config.json")) {
		const id = cache!.files[`config.json`].hex;
		if (isNpm) {
			wlintConfig = await getNpmPackageFile(original, id);
		} else {
			wlintConfig = await getGitHubFile(original, `config.json`);
		}
		wlintConfig = JSON.parse(wlintConfig);
	}

	let category: string | undefined =
		autoMatcher(wlintConfig?.categories) || argv.c || argv.category;

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
			onCancel: promptsOnCancel,
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
	fileList = fileList.filter(
		(file) => SUPPORT_LINTER.includes(file) || file === "config.json"
	);

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
					packages: parseNpmPackages(linter, data, aliases),
				});
				console.log(`${green("✔")} .${linter}rc generated`);
				console.log(`${green("✔")} npmPackages recorded:`, npmPackages);
			}
		}
	}

	console.log(`${blue("ℹ")} Installing linter dependencies...`);

	if (!packageManager) {
		boom(
			`packageManager is undefined, please create an issue in https://github.com/wibus-wee/wlint/issues`
		);
		return;
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
