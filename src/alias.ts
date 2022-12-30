import fs from "node:fs";
import { spawnSync } from "child_process";
import { cyan, green, red } from "kolorist";
import prompts from "prompts";
import { Iminimist } from "./types";
import { getShell } from "./utils";
import { CONFIG } from "./constants";

function consoleSource(filename: string) {
	console.log(`You should restart your terminal to apply the changes`);
	console.log(`Or run ${cyan("source")} ~/${filename}`);
}

export const alias = async (argv: Iminimist) => {
	const shell = getShell();
	const type =
		(argv._.includes("install") && "install") ||
		(argv._.includes("uninstall") && "uninstall");
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
				initial: `~/.${shell}rc`,
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
				throw new Error(`${red("✖")} Operation cancelled`);
			},
		}
	);

	const alias = argv.alias || res.alias || undefined;
	const shellrc = res.shellrc;

	switch (type) {
		case "install":
			if (res.confirm) {
				console.log(`${green("✔")} Alias ${cyan(alias)} installed`);
				console.log(
					`${green("✔")} ${cyan(
						"alias"
					)} ${alias}="wlint >> ${shellrc}"`
				);
				spawnSync("echo", [`alias ${alias}="wlint" >> ${shellrc}`], {
					stdio: "inherit",
				});

				console.log(`Configuring wlint config file...`);
				const file = JSON.parse(
					fs.readFileSync(CONFIG, "utf8").toString()
				);
				fs.writeFileSync(`${CONFIG}`, {
					...file,
					alias: [...file.alias, alias],
				});
			}
			break;
		case "uninstall":
			if (res.confirm) {
				console.log(`${green("✔")} Alias ${cyan(alias)} uninstalled`);
				console.log(`${green("✔")} ${cyan("unalias")} ${alias}`);

				let file = fs.readFileSync(shellrc, "utf8").toString();
				const config = JSON.parse(
					fs.readFileSync(CONFIG, "utf8").toString()
				);
				const configAlias = config.alias as string[];
				configAlias.map((alias) => {
					file = file.replace(`alias ${alias}="wlint"`, "");
				});
				fs.writeFileSync(shellrc, file);
			}
			break;
	}

	consoleSource(shellrc);
};
