import minimist from "minimist";
import { alias } from "./alias";
import { config } from "./config";
import { main } from "./main";
import { Iminimist } from "./types";

const argv = minimist<Iminimist>(process.argv.slice(2), { string: ["_"] });

async function init() {
	try {
		switch (argv._[0]) {
			case "alias":
				await alias(argv);
				break;
			case "config":
				await config(argv);
				break;
			default:
				main(argv);
				break;
		}
	} catch (e) {
		console.error(e);
	}
}

init().catch((e) => {
	console.error(e);
});
