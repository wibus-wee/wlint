import path from "path";
import { __DEV__ } from "./utils";
import { userHome } from "./utils/user";

export const WLINT = __DEV__
  ? `${userHome}/.wlint`
  : `${path.resolve(process.cwd())}/temp`;
export const CONFIG = `${WLINT}/.wlintrc.json`;
export const ORIGINAL = `wibus-wee/wlint-config`;

export const SUPPORT_LINTER = [
  "eslint.json",
  "prettier.json",
  "stylelint.json",
  "commitlint.json",
];
export const SUPPORT_CONFIG_KEYS = [
  "alias:string",
  "autoMatch?:boolean",
  "origins?:string[]|string",
];
export const SUPPORT_WLINTRC_KEYS = [
  "origin:string",
  "category?:string",
  "packages?:string[]",
];

export const AUTO_MATCH = {
  nextjs: "next",
  react: "react",
  vue: "vue",
  angular: "angular",
  jwcjs: "jwcjs",
};

export const IGNORE_DIRS = ["node_modules"];
