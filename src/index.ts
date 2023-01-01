import minimist from "minimist";
import { alias } from "./actions/alias";
import { origin } from "./actions/origin";
import { main } from "./actions/main";
import { Iminimist } from "./types";
import { config } from "./actions/config";
import { lint } from "./actions/lint";

const argv = minimist<Iminimist>(process.argv.slice(2), { string: ["_"] });

async function init() {
	try {
		switch (argv._[0]) {
			case "alias":
				await alias(argv);
				break;
			case "origin":
				await origin(argv);
				break;
			case "install":
				await main(argv);
				break;
			case "config":
				await config(argv);
				break;
			case "lint":
				await lint(argv);
				break;
			default:
				await main(argv);
				break;
		}
	} catch (e) {
		console.error(e);
	}
}

init().catch((e) => {
	console.error(e);
});
