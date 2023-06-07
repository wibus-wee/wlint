import path from "path";
import { userHome } from "./utils/user";

const __DEV__ = process.env.NODE_ENV === "development";

export const WLINT = __DEV__
  ? `${path.resolve(process.cwd())}/temp`
  : `${userHome}/.config`;
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
