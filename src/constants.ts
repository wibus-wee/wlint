import { getUserHome } from "./utils";

export const WLINT = `${getUserHome()}/.config`;
export const CONFIG = `${WLINT}/.wlintrc.json`;
export const ORIGINAL = `wibusbot/wlint-config`;

export const SUPPORT_LINTER = ["eslint.json", "prettier.json"];
export const SUPPORT_CONFIG_KEYS = ["alias:string", "autoMatch?:boolean"];
