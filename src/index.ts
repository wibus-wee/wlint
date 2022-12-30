import minimist from "minimist";
import { alias } from "./alias";
import { Iminimist } from "./types";

const cwd = process.cwd();
const argv = minimist<Iminimist>(process.argv.slice(2), { string: ["_"] });

async function init() {
	try {
		switch (argv._[0]) {
			case "install" || "i" || "uninstall" || "un":
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
