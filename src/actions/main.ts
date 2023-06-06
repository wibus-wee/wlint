import fs from "node:fs";
import { blue, green, yellow } from "kolorist";
import { ORIGINAL, SUPPORT_LINTER } from "../constants";
import { Iminimist, NPMFiles } from "../types";
import {
  autoMatcher,
  detectPkgManage,
  isNpmPackage,
  userConfig,
  validateConfigConflict,
  __DEV__,
} from "../utils";
import { getGitHubFiles } from "../request";
import spawn from "cross-spawn";
import { boom } from "../error";
import { confirm, select } from "../prompts";
import {
  configureLinters,
  fetchCategoriesAndFiles,
  fetchRepoConfig,
  updateWlintRC,
} from "../utils/core";

export const main = async (argv: Iminimist) => {
  validateConfigConflict();

  const config = userConfig;
  let packageManager = detectPkgManage();
  const configOriginals = config.origins?.length
    ? config.origins
    : argv.origin
    ? [argv.origin]
    : [];

  if (configOriginals.length === 0) {
    const useDefault = await confirm(
      `Can't detect origin. Do you want to use the default one? (${green(
        `${ORIGINAL}`
      )})`
    );

    if (useDefault) {
      configOriginals.push(ORIGINAL);
    } else {
      boom(`Can't detect original, please specify one.`);
    }
  }

  if (!fs.existsSync("package.json")) {
    boom(`package.json not found, are you in the project root directory?`);
  }

  if (!packageManager) {
    console.log(`${blue("✖")} Can't detect package manager.`);
    packageManager = await select({
      message: `${blue("✖")} Can't detect package manager. Please select one:`,
      choices: ["npm", "yarn", "pnpm"],
    });
  }

  const original =
    configOriginals.length > 1
      ? await select({
          message: "Which original do you want to use?",
          choices: configOriginals,
        })
      : configOriginals[0];
  console.log(`${blue("ℹ")} Using ${green(original)} as original.`);

  const isNpm = isNpmPackage(original);
  let categories: Array<string> = [];
  let fileList: Array<string> = [];
  let cache: NPMFiles | undefined = undefined;

  const { _categories, _fileList, _cache } = await fetchCategoriesAndFiles(
    isNpm,
    original
  );
  categories = _categories;
  fileList = _fileList;
  cache = _cache;

  const repoConfig = await fetchRepoConfig(isNpm, fileList, original, cache);

  let category: string | undefined =
    autoMatcher(repoConfig?.categories) || argv.c || argv.category;

  if (category && !categories.includes(category)) {
    console.log(
      `${yellow("⚠")} Auto match category ${category} not found, turn to select`
    );
    category = undefined; // reset category
  }

  const selectCategory =
    (await select({
      message: "Which category do you want to use?",
      choices: categories,
    })) || category;

  console.log(blue("ℹ"), "Project Category:", selectCategory);

  if (selectCategory) {
    if (isNpm) {
      const data = cache!.files;
      Object.keys(data).forEach((key) => {
        if (key.match(/\//g)?.length === 2) {
          const category = key.split("/")[0];
          if (category === selectCategory) {
            const file = key.split("/")[1];
            fileList.push(file); // push category file to fileList
          }
        }
      });
    } else {
      const list = await getGitHubFiles(original, selectCategory);
      list.forEach((file) => {
        if (file.type === "file" && file.path.includes(selectCategory)) {
          fileList.push(file.name);
        }
      });
    }
  }
  fileList = fileList.filter(
    (file) => SUPPORT_LINTER.includes(file) || file === "config.json"
  );

  const npmPackages = await configureLinters(
    isNpm,
    fileList,
    original,
    selectCategory,
    repoConfig,
    cache
  );

  console.log(`${blue("ℹ")} Installing linter dependencies...`);

  if (!packageManager) {
    boom(
      `packageManager is undefined, please create an issue in https://github.com/wibus-wee/wlint/issues`
    );
    return;
  }
  console.log(
    `${blue("ℹ")} ${packageManager} add -D ${npmPackages
      .map((item) => item.packages.join(" "))
      .join(" ")}`
  );
  !__DEV__ &&
    spawn.sync(
      packageManager,
      [
        "add",
        "-D",
        npmPackages.map((item) => item.packages.join(" ")).join(" "),
      ],
      { stdio: "inherit" }
    );

  console.log(`${green("✔")} Linter dependencies installed`);

  updateWlintRC(original, selectCategory, npmPackages);
};
