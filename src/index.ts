import minimist from "minimist";
import { alias } from "./actions/alias";
import { origin } from "./actions/origin";
import { main } from "./actions/main";
import { Iminimist } from "./types";
import { config } from "./actions/config";
import { validateWlintRc } from "./utils";

const argv = minimist<Iminimist>(process.argv.slice(2), { string: ["_"] });

async function init() {
	validateWlintRc();
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
