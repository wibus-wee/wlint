import fs from "node:fs";
import { blue, green, red, yellow } from "kolorist";
import prompts from "prompts";
import { Iminimist } from "./types";
import { configFile } from "./utils";
import { CONFIG } from "./constants";

function isValidateType(_: string[]) {
	if (!(_[1] === "add" || _[1] === "remove")) {
		throw new Error(`${red("✖")} Invalid type`);
	}
}

function setConfig(type, originalConfig, original) {
	switch (type) {
		case "add":
			if (originalConfig.originals?.includes(original)) {
				throw new Error(
					`${red("✖")} The original repository already exists`
				);
			}
			console.log(`${blue("ℹ [wlint]")} Injecting wlint config file...`);
			fs.writeFileSync(
				CONFIG,
				JSON.stringify({
					...originalConfig,
					originals: [...(originalConfig.originals || []), original],
				}),
				{ encoding: "utf-8" }
			);
			console.log(`${green("✔")} Original repository added`);
			break;
		case "remove":
			if (!originalConfig.originals?.includes(original)) {
				throw new Error(
					`${red("✖")} The original repository does not exist`
				);
			}
			console.log(`${blue("ℹ [wlint]")} Removing original repository...`);
			fs.writeFileSync(
				CONFIG,
				JSON.stringify({
					...originalConfig,
					originals: originalConfig.originals.filter(
						(_: string) => _ !== original
					),
				}),
				{ encoding: "utf-8" }
			);
			console.log(`${green("✔")} Original repository removed`);
			break;
		default:
			console.log(
				`${yellow(
					"ℹ [warning]"
				)} You have not entered a type, defaulting to add`
			);
			setConfig("add", originalConfig, original);
	}
}

export const config = async (argv: Iminimist) => {
	isValidateType(argv._);
	const res = await prompts(
		[
			{
				type: !argv._[2] ? "text" : null,
				name: "original",
				message: "Enter the original repository",
				initial: "wibus-wee/wlint-config",
			},
		],
		{
			onCancel: () => {
				throw new Error(`${red("✖")} Operation cancelled`);
			},
		}
	);

	const original = argv._[2] || res.original;
	const originalConfig = configFile;

	setConfig(argv._[1], originalConfig, original);
};
