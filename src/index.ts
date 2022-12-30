import minimist from "minimist";
import { alias } from "./alias";
import { Iminimist } from "./types";

const argv = minimist<Iminimist>(process.argv.slice(2), { string: ["_"] });

async function init() {
	try {
		switch (argv._[0]) {
			case "install":
				await alias(argv);
				break;
			case "uninstall":
				await alias(argv);
				break;
			default:
				console.log("No command found");
				break;
		}
	} catch (e) {
		console.error(e);
	}
}

init().catch((e) => {
	console.error(e);
});
