import { Iminimist } from "../types";
import spawn from "cross-spawn";
import { argsx, detectPkgManage, hasWlintConfig } from "../utils";
import { boom } from "../error";

const validateType = (argv: Iminimist) => {
	if (argv._[1] && argv._[1] != "fix") {
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
	if (hasWlintConfig()) {
		spawn.sync(command, argsx("eslint", ".", { "--fix": fix }));
		spawn.sync(command, argsx("prettier", ".", { "--write": fix }));
		spawn.sync(command, argsx("stylelint", ".", { "--fix": fix }));
	} else {
		boom("No wlint config found.");
	}
}
