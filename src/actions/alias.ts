import fs from "node:fs";
import { blue, cyan, green, red } from "kolorist";
import prompts from "prompts";
import { Iminimist } from "../types";
import { configFile, getShell, getUserHome, isValidateType } from "../utils";
import { CONFIG } from "../constants";

function consoleSource(filename: string) {
	console.log(`\nYou should restart your terminal to apply the changes`);
	console.log(`Or run ${cyan(`source ${filename}`)}`);
}
export const alias = async (argv: Iminimist) => {
	isValidateType(argv._);
	const shell = getShell();
	const type = (function () {
		if (argv._[1] === "add") return "install";
		if (argv._[1] === "remove") return "uninstall";
		return "install";
	})();
	if (configFile.alias.length === 0 && type === "uninstall") {
		throw new Error(`${red("✖")} No alias found`);
	}
	const res = await prompts(
		[
			{
				type: type === "install" ? (argv.alias ? null : "text") : null,
				name: "alias",
				message: `Enter the alias for wlint`,
				initial: "ww",
			},
			{
				type: "text",
				name: "shellrc",
				message: `Enter the path to your ${shell}rc file`,
				initial: `.${shell}rc`,
			},
			{
				type: type === "uninstall" ? "multiselect" : null,
				name: "alias",
				message: `Select the alias you want to uninstall`,
				choices: [
					...configFile.alias.map((alias: string) => ({
						title: alias,
						value: alias,
					})),
				],
			},
			{
				type: "confirm",
				name: "confirm",
				message: `Do you want to ${type} the alias?`,
				initial: true,
			},
		],
		{
			onCancel: () => {
				console.log(`${red("✖")} Operation cancelled`);
				process.exit(0);
			},
		}
	);

	const alias = argv.alias?.split(",") || res.alias || undefined;
	const shellrc = `${getUserHome()}/${res.shellrc}`;

	switch (type) {
		case "install":
			if (res.confirm) {
				if (
					fs
						.readFileSync(shellrc, "utf8")
						.toString()
						.includes(`alias ${alias}="wlint"`)
				) {
					console.log(
						`${red("✖")} Alias ${cyan(alias)} already exists`
					);
					consoleSource(shellrc);
					process.exit(1);
				}
				fs.appendFileSync(shellrc, `\nalias ${alias}="wlint"`);

				console.log(
					`${green("✔")} ${cyan("alias")} Added to ${cyan(
						shellrc
					)} file. "`
				);

				console.log(`Configuring wlint config file...`);

				const config = {
					...configFile,
					alias: [...configFile.alias, alias],
				};
				console.log(
					`${blue("ℹ [wlint]")} Injecting wlint config file...`
				);
				fs.writeFileSync(CONFIG, JSON.stringify(config));

				console.log(`${green("✔")} Alias ${cyan(alias)} installed`);
			}
			break;
		case "uninstall":
			if (res.confirm) {
				let file = fs.readFileSync(shellrc, "utf8").toString();
				const configAlias = configFile.alias as string[];
				configAlias.map((alias) => {
					file = file.replace(`alias ${alias}="wlint"`, "");
				});
				fs.writeFileSync(shellrc, file);
				const config = {
					...configFile,
					alias: configAlias.filter((a) => !res.alias.includes(a)),
				};
				console.log(
					`${blue("ℹ [wlint]")} Injecting wlint config file...`
				);
				fs.writeFileSync(CONFIG, JSON.stringify(config));
				console.log(`${green("✔")} Alias ${cyan(alias)} uninstalled`);
			}
			break;
	}

	consoleSource(shellrc);
};
