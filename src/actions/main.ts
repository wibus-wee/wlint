import fs from "node:fs";
import { blue, green, yellow } from "kolorist";
import prompts from "prompts";
import { IGNORE_DIRS, ORIGINAL, SUPPORT_LINTER } from "../constants";
import { Iminimist, InpmPackages, NPMFiles } from "../types";
import {
	autoMatcher,
	detectPkgManage,
	generateLinterRcFile,
	isNpmPackage,
	parseNpmPackages,
	userConfig,
	validateConfigConflict,
	setWlintConfig,
	__DEV__,
} from "../utils";
import {
	getGitHubFile,
	getGitHubFiles,
	getNpmPackageFile,
	getNpmPackageFiles,
	getNpmPackageInfo,
} from "../request";
import spawn from "cross-spawn";
import { boom, promptsOnCancel } from "../error";

export const main = async (argv: Iminimist) => {
	validateConfigConflict();

	const config = userConfig;
	let packageManager = detectPkgManage();
	// 这个要留给 用户 去选择要用谁的，如果只有一个的话就其实不需要选择了
	const configOriginals = config.origins?.length
		? config.origins
		: argv.origin
		? [argv.origin]
		: [];

	if (configOriginals.length === 0) {
		const res = await prompts(
			[
				{
					type: "confirm",
					name: "useDefault",
					message: `${blue(
						"✖"
					)} Can't detect origin. Do you want to use the default one? (${green(
						`${ORIGINAL}`
					)})`,
					initial: true,
				},
			],
			{
				onCancel: promptsOnCancel,
			}
		);
		if (res.useDefault) {
			configOriginals.push(ORIGINAL);
		}
		if (!res.useDefault) {
			boom(`Can't detect original, please specify one.`);
		}
	}

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

	const original =
		configOriginals.length > 1 ? res.original : configOriginals[0];
	console.log(`${blue("ℹ")} Using ${green(original)} as original.`);
	const isNpm = isNpmPackage(original);
	let categories: Array<string> = [];
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

	categories = categories.filter((category) => !category.includes("."));
	categories = categories.filter(
		(category) => !IGNORE_DIRS.includes(category)
	);

	fileList = fileList.filter(
		(file) => SUPPORT_LINTER.includes(file) || file === "config.json"
	);

	console.log(`${blue("ℹ")} Scaning wlint repo config...`);
	let repoConfig: any;
	if (fileList.includes("config.json")) {
		const id = cache!.files[`config.json`].hex;
		if (isNpm) {
			repoConfig = await getNpmPackageFile(original, id);
		} else {
			repoConfig = await getGitHubFile(original, `config.json`);
		}
		repoConfig = JSON.parse(repoConfig);
	}

	let category: string | undefined =
		autoMatcher(repoConfig?.categories) || argv.c || argv.category;

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

	if (selectCategory) {
		if (isNpm) {
			const data = cache!.files;
			Object.keys(data).forEach((key) => {
				if (key.match(/\//g)?.length === 2) {
					const category = key.split("/")[0];
					if (category === selectCategory) {
						const file = key.split("/")[1];
						fileList.push(file); // push category file to fileList
					}
				}
			});
		} else {
			const list = await getGitHubFiles(original, selectCategory);
			list.forEach((file) => {
				if (
					file.type === "file" &&
					file.path.includes(selectCategory)
				) {
					fileList.push(file.name);
				}
			});
		}
	}
	fileList = fileList.filter(
		(file) => SUPPORT_LINTER.includes(file) || file === "config.json"
	);

	const npmPackages = new Array<InpmPackages>(); // 需要安装的包

	console.log(`${blue("ℹ")} Configuring linter...`);

	let data: object = {};

	for (const linter of SUPPORT_LINTER) {
		console.log(`${blue("ℹ")} Configuring ${linter}...`);
		if (fileList.includes(`${linter}`)) {
			const aliases = repoConfig?.aliases || {};
			const path = `${
				selectCategory ? `${selectCategory}/` : ""
			}${linter}`;
			if (isNpm) {
				const fileId = cache!.files[path].hex;
				data = await getNpmPackageFile(original, fileId);
			} else {
				console.log(
					`${blue("ℹ")} Generating .${linter.replace(
						".json",
						""
					)}rc...`
				);
				data = await getGitHubFile(original, path);
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
			.join(" ")}`
	);
	!__DEV__ &&
		spawn.sync(
			packageManager,
			[
				"add",
				"-D",
				npmPackages.map((item) => item.packages.join(" ")).join(" "),
			],
			{ stdio: "inherit" }
		);

	console.log(`${green("✔")} Linter dependencies installed`);

	console.log(`${blue("ℹ")} Generating .wlintrc...`);
	setWlintConfig("origin", original);
	setWlintConfig("category", selectCategory);
	setWlintConfig("aliases", repoConfig?.aliases || {});
	setWlintConfig("packages", npmPackages.map((item) => item.packages).flat());
	console.log(`${green("✔")} .wlintrc auto generated`);
};
