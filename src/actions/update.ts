import spawn from "cross-spawn";
import { blue, green } from "kolorist";
import {
  configureLinters,
  fetchCategoriesAndFiles,
  fetchRepoConfig,
  updateWlintRC,
} from "../utils/core";
import { boom } from "../error";
import { NPMFiles } from "../types";
import {
  detectPkgManage,
  getWlintConfig,
  hasWlintConfig,
  isNpmPackage,
  wlintConfig,
  __DEV__,
} from "../utils";

export async function update() {
  if (!hasWlintConfig()) {
    boom("No wlint config file found. Please run `wlint` first.");
  }
  const config = getWlintConfig();
  const origin: string = config.origin;
  const packageManager = detectPkgManage();
  const category: string | undefined = config.category;

  const isNpm = isNpmPackage(origin);

  let fileList: Array<string> = [];
  let cache: NPMFiles | undefined = undefined;
  console.log(`${blue(`ℹ`)} Updating your linter config...`);

  const { _fileList, _cache } = await fetchCategoriesAndFiles(isNpm, origin);

  fileList = _fileList;
  cache = _cache;

  const repoConfig = await fetchRepoConfig(isNpm, fileList, origin, cache);

  if (category) {
    if (!Object.keys(repoConfig?.categories).includes(category)) {
      boom(`Category ${category} not found.`);
    }
  }

  console.log(`${blue("ℹ")} Scaning wlint repo config...`);

  const npmPackages = await configureLinters(
    isNpm,
    fileList,
    origin,
    category,
    repoConfig,
    cache
  );

  console.log(`${blue("ℹ")} Comparing npm packages...`);
  const _npmPackages = new Array<string>();
  const _installNpmPackages = new Array<string>();
  const _deleteNpmPackages = new Array<string>();

  npmPackages.forEach((item) => {
    item.packages.forEach((item) => {
      _npmPackages.push(item);
    });
  });

  wlintConfig.packages.forEach((item) => {
    if (!_npmPackages.includes(item)) {
      _deleteNpmPackages.push(item);
    }
  });

  _npmPackages.forEach((item) => {
    if (!wlintConfig.packages.includes(item)) {
      _installNpmPackages.push(item);
    }
  });

  if (!packageManager) {
    boom(
      `packageManager is undefined, please create an issue in https://github.com/wibus-wee/wlint/issues`
    );
    return;
  }

  if (_installNpmPackages.length > 0) {
    console.log(
      `${blue("ℹ")} Installing new npm packages: ${_installNpmPackages.join(
        ", "
      )}`
    );
    console.log(
      `${blue("ℹ")} ${packageManager} add -D ${_installNpmPackages.join(" ")}`
    );

    if (!__DEV__) {
      for (let i = 0; i < _installNpmPackages.length; i++) {
        spawn.sync(packageManager, ["add", "-D", _installNpmPackages[i]]);
      }
    }
    console.log(`${green("✔")} New npm packages installed`);
  }

  if (_deleteNpmPackages.length > 0) {
    console.log(
      `${blue("ℹ")} Removing old npm packages: ${_deleteNpmPackages.join(", ")}`
    );
    console.log(
      `${blue("ℹ")} ${packageManager} remove -D ${_deleteNpmPackages.join(" ")}`
    );
    if (!__DEV__) {
      for (let i = 0; i < _deleteNpmPackages.length; i++) {
        spawn.sync(packageManager, ["remove", "-D", _deleteNpmPackages[i]]);
      }
    }
    console.log(`${green("✔")} Old npm packages removed`);
  }

  if (_installNpmPackages.length === 0 && _deleteNpmPackages.length === 0) {
    console.log(`${blue("ℹ")} No npm packages need to be installed or removed`);
  }

  let _packages = new Array<string>();
  // 除了install和delete，还有可能是update
  npmPackages.forEach((item) => {
    item.packages.forEach((item) => {
      _packages.push(item);
    });
  });

  _packages = _packages.filter((item) => {
    return (
      !_installNpmPackages.includes(item) && !_deleteNpmPackages.includes(item)
    );
  }); // 去重, 保证不会重复安装

  if (_packages.length > 0) {
    console.log(`${blue("ℹ")} Updating npm packages: ${_packages.join(", ")}`);
    console.log(`${blue("ℹ")} ${packageManager} update ${_packages.join(" ")}`);
    if (!__DEV__) {
      for (let i = 0; i < _packages.length; i++) {
        spawn.sync(packageManager, ["update", _packages[i]]);
      }
    }
    console.log(`${green("✔")} All packages updated`);
  }

  console.log(`${green("✔")} Update completed`);

  updateWlintRC(origin, category, npmPackages);
}
