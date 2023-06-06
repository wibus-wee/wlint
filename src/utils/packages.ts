import { yellow, cyan } from "kolorist";
import path from "node:path";
import fs from "node:fs";

export function isNpmPackage(name: string) {
  return (
    (name.startsWith("@") && name.indexOf("/") === name.lastIndexOf("/")) ||
    (!name.startsWith("@") && !name.includes("/"))
  );
}

// parse npm packages from eslint and prettier config file to install
export function parseNpmPackages(linter: string, json: string, alias: string) {
  const parsed = JSON.parse(JSON.stringify(json));
  const aliases = JSON.parse(JSON.stringify(alias));
  const npmPackages = [
    ...(parsed.extends?.filter((plugin: string) => isNpmPackage(plugin)) || []), // eslint, prettier(extra extends), stylelint
    ...(parsed.plugins?.filter((plugin: string) => isNpmPackage(plugin)) || []), // eslint
    ...(parsed.parser || []), // eslint(only one, @typescript-eslint/parser)
    ...(parsed.parserPreset || []), // commitlint
    ...(parsed.formatter || []), // stylelint
  ];
  if (json.includes("@typescript-eslint")) {
    npmPackages.push("@typescript-eslint/eslint-plugin");
  }
  switch (linter) {
    case "eslint.json":
      npmPackages.push("eslint");
      break;
    case "prettier.json":
      npmPackages.push("prettier");
      break;
    case "stylelint.json":
      npmPackages.push("stylelint");
      break;
    case "commitlint.json":
      npmPackages.push("@commitlint/cli");
      break;
  }
  if (aliases) {
    npmPackages.forEach((item: string, index: number) => {
      if (aliases[item]) {
        console.log(
          `${yellow("⚠")} Alias: ${cyan(item)} -> ${cyan(aliases[item])}`
        );
        npmPackages[index] = aliases[item];
      }
    });
  }
  return npmPackages;
}

export function detectPkgManage() {
  const cwd = process.cwd();
  const resolve = (file: string) => path.resolve(cwd, file);
  if (fs.existsSync(resolve("yarn.lock"))) return "yarn";
  if (fs.existsSync(resolve("pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(resolve("package-lock.json"))) return "npm";
  return null;
}
