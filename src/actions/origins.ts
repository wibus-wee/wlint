import fs from "node:fs";
import { blue, green, yellow } from "kolorist";
import prompts from "prompts";
import { Iminimist } from "../types";
import { userConfig, validateType } from "../utils";
import { CONFIG } from "../constants";
import { boom, promptsOnCancel } from "../error";

function setConfig(
	type: string,
	originConfig: { origins: string[] },
	origin: string
) {
	switch (type) {
		case "add":
			if (originConfig.origins?.includes(origin)) {
				boom(`The origin repository already exists`);
			}
			console.log(`${blue("ℹ [wlint]")} Injecting wlint config file...`);
			fs.writeFileSync(
				CONFIG,
				JSON.stringify({
					...originConfig,
					origins: [...(originConfig.origins || []), origin],
				}),
				{ encoding: "utf-8" }
			);
			console.log(`${green("✔")} origin repository added`);
			break;
		case "remove":
			if (!originConfig.origins?.includes(origin)) {
				boom(`The origin repository does not exist`);
			}
			console.log(`${blue("ℹ [wlint]")} Removing origin repository...`);
			fs.writeFileSync(
				CONFIG,
				JSON.stringify({
					...originConfig,
					origins: originConfig.origins.filter(
						(_: string) => _ !== origin
					),
				}),
				{ encoding: "utf-8" }
			);
			console.log(`${green("✔")} origin repository removed`);
			break;
		default:
			console.log(
				`${yellow(
					"ℹ [warning]"
				)} You have not entered a type, defaulting to add`
			);
			setConfig("add", originConfig, origin);
	}
}

export const origins = async (argv: Iminimist) => {
	validateType(argv._);
	const res = await prompts(
		[
			{
				type: !argv._[2] ? "text" : null,
				name: "origin",
				message: "Enter the origin repository",
				initial: "wibus-wee/wlint-config",
			},
		],
		{
			onCancel: promptsOnCancel,
		}
	);

	const origin = argv._[2] || res.origin;
	const originConfig = userConfig;

	setConfig(argv._[1], originConfig, origin);
};
