import { Iminimist } from "src/types";
import spawn from "cross-spawn";
import { argsx, detectPkgManage } from "src/utils";
import { boom } from "src/error";

const validateType = (argv: Iminimist) => {
	if (!argv._ || argv._[1] != "fix") {
		boom("Invalid type");
	}
};

export async function lint(argv: Iminimist) {
	validateType(argv);
	const pkgManager = detectPkgManage();
	if (!pkgManager) boom("No package manager founded.");
	const fix = argv._[1] === "fix";
	const command = (function () {
		switch (pkgManager) {
			case "pnpm":
				return "pnpm";
			case "yarn":
				return "yarn";
			default:
				return "npx";
		}
	})();
	spawn.sync(command, argsx("eslint", ".", { "--fix": fix }));
	spawn.sync(command, argsx("prettier", ".", { "--write": fix }));
	spawn.sync(command, argsx("stylelint", ".", { "--fix": fix }));
}
