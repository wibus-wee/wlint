import fs from "node:fs";
import { blue, green, yellow } from "kolorist";
import prompts from "prompts";
import { Iminimist } from "../types";
import { userConfig, validateType } from "../utils";
import { CONFIG } from "../constants";
import { boom, promptsOnCancel } from "../error";

function setConfig(
	type: string,
	originalConfig: { originals: string[] },
	original: string
) {
	switch (type) {
		case "add":
			if (originalConfig.originals?.includes(original)) {
				boom(`The original repository already exists`);
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
				boom(`The original repository does not exist`);
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

export const origin = async (argv: Iminimist) => {
	validateType(argv._);
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
			onCancel: promptsOnCancel,
		}
	);

	const original = argv._[2] || res.original;
	const originalConfig = userConfig;

	setConfig(argv._[1], originalConfig, original);
};
