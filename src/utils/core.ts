import { blue, green } from "kolorist";
import { IGNORE_DIRS, SUPPORT_LINTER } from "src/constants";
import { InpmPackages, NPMFiles } from "src/types";
import { boom } from "../error";
import {
  getNpmPackageInfo,
  getNpmPackageFiles,
  getGitHubFiles,
  getGitHubFile,
  getNpmPackageFile,
} from "../request";
import { generateLinterRcFile, prettyStringify } from "./generator";
import { parseNpmPackages } from "./packages";
import { setWlintConfig } from "./wlintrc";

export async function fetchCategoriesAndFiles(
  isNpm: boolean,
  category?: string | undefined
) {
  let categories: Array<string> = [];
  let fileList: Array<string> = [];
  let npmList: NPMFiles | undefined;
  if (isNpm) {
    const latest = (await getNpmPackageInfo(origin))["dist-tags"].latest;
    if (!latest) {
      boom(`Can't get latest version of ${origin}`);
    }
    npmList = await getNpmPackageFiles(origin, latest);
    // cache = npmList;

    Object.keys(npmList.files).forEach((key) => {
      if (category) {
        // if category is defined, only get files from that category
        if (!key?.match(/\//g)?.length) {
          categories.push(key);
        }
        if (key?.match(/\//g)?.length === 2) {
          const category = key.split("/")[0];
          if (!categories.includes(category)) {
            categories.push(category);
          }
        }
        const data = npmList!.files;
        Object.keys(data).forEach((key) => {
          if (key.match(/\//g)?.length === 2) {
            const _category = key.split("/")[0];
            if (_category === category) {
              const file = key.split("/")[1];
              fileList.push(file); // push category file to fileList
            }
          }
        });
      }
      if (key === "config.json") {
        fileList.push(key);
      }
    });

    if (categories.length === 0 && !category) {
      Object.keys(npmList.files).forEach((key) => {
        const file = key.split("/")[1];
        fileList.push(file);
      });
    }
  } else {
    const list = await getGitHubFiles(origin);
    list.forEach((file) => {
      if (file.type === "dir" && category) {
        categories.push(file.name);
      }
      if (file.type === "file" || file.name === "config.json") {
        fileList.push(file.name);
      }
    });

    if (categories.length === 0 && !category) {
      list.forEach((file) => {
        if (file.type === "file") {
          fileList.push(file.name);
        }
      });
    }

    if (category) {
      const _list = await getGitHubFiles(origin, category);
      _list.forEach((file) => {
        if (file.type === "file" && file.path.includes(category)) {
          fileList.push(file.name);
        }
      });
    }
  }

  categories = categories.filter((category) => !category.includes("."));
  categories = categories.filter((category) => !IGNORE_DIRS.includes(category));

  fileList = fileList.filter(
    (file) => SUPPORT_LINTER.includes(file) || file === "config.json"
  );

  return {
    _categories: categories,
    _fileList: fileList,
    _cache: npmList,
  };
}

export async function fetchRepoConfig(
  isNpm: boolean,
  fileList: Array<string>,
  original: string,
  cache?: NPMFiles | undefined
) {
  let repoConfig: any = {};
  console.log(`${blue("ℹ")} Scaning wlint repo config...`);
  if (fileList.includes("config.json")) {
    if (isNpm) {
      const id = cache!.files[`config.json`].hex;
      repoConfig = await getNpmPackageFile(original, id);
    } else {
      repoConfig = await getGitHubFile(original, `config.json`);
    }
    repoConfig = repoConfig ? JSON.parse(JSON.stringify(repoConfig)) : {};
  }
  return repoConfig;
}

export async function configureLinters(
  isNpm: boolean,
  fileList: Array<string>,
  original: string,
  selectCategory?: string | undefined,
  repoConfig?: any,
  cache?: NPMFiles | undefined
) {
  const npmPackages = new Array<InpmPackages>(); // 需要安装的包

  console.log(`${blue("ℹ")} Configuring linter...`);

  let data: object = {};

  for (const linter of SUPPORT_LINTER) {
    console.log(`${blue("ℹ")} Configuring ${linter}...`);
    if (fileList.includes(`${linter}`)) {
      const aliases = repoConfig?.aliases || {};
      const path = `${selectCategory ? `${selectCategory}/` : ""}${linter}`;
      if (isNpm) {
        const fileId = cache!.files[path].hex;
        data = await getNpmPackageFile(original, fileId);
      } else {
        console.log(
          `${blue("ℹ")} Generating .${linter.replace(".json", "")}rc...`
        );
        data = await getGitHubFile(original, path);
      }
      generateLinterRcFile(linter, prettyStringify(data));
      console.log(`${green("✔")} .${linter.replace(".json", "")}rc generated`);
      npmPackages.push({
        linter,
        packages: parseNpmPackages(linter, JSON.stringify(data), aliases),
      });
      console.log(
        `${green("✔")} ${linter.replace(".json", "")} npm packages recorded`
      );
    }
  }

  return npmPackages;
}

export function updateWlintRC(
  origin: string,
  category: string | undefined,
  packages: Array<InpmPackages>
) {
  console.log(`${blue("ℹ")} Generating .wlintrc...`);
  setWlintConfig("origin", origin);
  setWlintConfig("category", category);
  setWlintConfig("packages", packages.map((item) => item.packages).flat());
  console.log(`${green("✔")} .wlintrc auto generated`);
}
