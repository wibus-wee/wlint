import { userHome } from "./utils/user";
export const WLINT = `${userHome}/.config`;
export const CONFIG = `${WLINT}/.wlintrc.json`;
export const ORIGINAL = `wibusbot/wlint-config`;

export const SUPPORT_LINTER = [
	"eslint.json",
	"prettier.json",
	"stylelint.json",
	"commitlint.json",
];
export const SUPPORT_CONFIG_KEYS = ["alias:string", "autoMatch?:boolean"];
export const SUPPORT_WLINTRC_KEYS = ["origin:string", "category:string"];

export const AUTO_MATCH = {
	nextjs: "next",
	react: ["react", "react-dom"],
	vue: "vue",
	angular: "angular",
	jwcjs: "jwcjs",
};
