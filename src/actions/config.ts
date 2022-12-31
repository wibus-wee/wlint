import { cyan, green, red, yellow } from "kolorist";
import { Iminimist } from "../types";
import { configFile, isValidateConfigType, setConfig } from "../utils";

export async function config(argv: Iminimist) {
	isValidateConfigType(argv._);

	const action = argv._[1];
	const key = argv._[2];
	const value = argv._[3];
	const config = configFile;

	switch (action) {
		case "set":
			if (config[key] && config[key].includes(value)) {
				console.log(
					`${red("✖")} ${cyan(value)} already exists in ${key}`
				);
				process.exit(1);
			}
			config[key] ? config[key].push(value) : (config[key] = [value]);
			setConfig(key, config[key]);
			console.log(
				`${green("✔")} Added ${cyan(value)} to ${key} successfully`
			);
			break;
		case "get":
			console.log(`${key}: ${config[key]}`);
			break;
		case "remove":
			if (value && !config[key].includes(value)) {
				console.log(
					`${red("✖")} ${cyan(value)} does not exist in ${key}`
				);
				process.exit(1);
			}
			if (!value) {
				delete config[key];
				setConfig(key, config[key]);
				console.log(`${yellow("ℹ")} Removed ${key} successfully`);
				break;
			}
			config[key] = config[key].filter((_: string) => _ !== value);
			setConfig(key, config[key]);
			console.log(
				`${yellow("ℹ")} Removed ${cyan(value)} from ${key} successfully`
			);
			break;
		case "list":
			console.log(config);
			break;
		default:
			console.log(`${yellow("ℹ [warning]")} You have not entered a type`);
			process.exit(1);
	}
}
