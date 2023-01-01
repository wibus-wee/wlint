import { getUserHome } from "./utils";

export const WLINT = `${getUserHome()}/.config`;
export const CONFIG = `${WLINT}/.wlintrc.json`;
export const ORIGINAL = `wibusbot/wlint-config`;

export const SUPPORT_LINTER = [
	"eslint.json",
	"prettier.json",
	"stylelint.json",
	"commitlint.json",
];
export const SUPPORT_CONFIG_KEYS = ["alias:string", "autoMatch?:boolean"];

export const AUTO_MATCH = {
	nextjs: "next",
	react: ["react", "react-dom"],
	vue: "vue",
	angular: "angular",
	jwcjs: "jwcjs",
};
