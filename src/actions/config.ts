import { cyan, green, yellow } from "kolorist";
import { boom } from "../error";
import { Iminimist } from "../types";
import { configFile, validateConfigType, setConfig } from "../utils";

export async function config(argv: Iminimist) {
	validateConfigType(argv._);

	const action = argv._[1];
	const key = argv._[2];
	const value = argv._[3];
	const config = configFile;

	switch (action) {
		case "set":
			if (config[key] && config[key].includes(value)) {
				boom(`${cyan(value)} already exists in ${key}`);
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
				boom(`${cyan(value)} does not exist in ${key}`);
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
			boom(`You have not entered a correct action: set|get|remove|list`);
	}
}
