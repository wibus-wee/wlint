import { ParsedArgs } from "minimist";

export type Iminimist = {
  c?: string; // alias for category
  category?: string;

  // install?: boolean; // install alias into .bashrc or .zshrc
  // i?: boolean; // alias for install

  // uninstall?: boolean; // uninstall alias from .bashrc or .zshrc
  // un?: boolean; // alias for uninstall

  // origin?: string; // origin of the config file
  // o?: string; // alias for origin

  alias?: string; // alias for wlint

  original?: string; // original repository
} & ParsedArgs;

export interface NPMFiles {
  files: FilesClass;
  totalSize: number;
  fileCount: number;
  shasum: string;
  integrity: string;
}

export interface FilesClass {
  [filename: string]: License;
}

export interface License {
  size: number;
  type: string;
  path: string;
  contentType: string;
  hex: string;
  isBinary: string;
  linesCount: number;
}

// --------------------------------------------

export interface GitHubFiles {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: null | string;
  type: Type;
  _links: Links;
}

export interface Links {
  self: string;
  git: string;
  html: string;
}

export enum Type {
  Dir = "dir",
  File = "file",
}

export interface InpmPackages {
  linter: string;
  packages: string[];
}

export interface NpmPackage {
  _id: string;
  _rev: string;
  name: string;
  "dist-tags": {
    latest: string;
    next?: string;
    experimental?: string;
    beta?: string;
    rc?: string;
  };
  versions: Version;
  time: Record<string, string>;
  maintainers: Array<{
    name: string;
    email: string;
  }>;
  description: string;
  keywords: string[];
  license: string;
  readme: string;
  readmeFilename: string;
}

export interface Version {
  name: string;
  version: string;
  description: string;
  main: string;
  scripts: Record<string, string>;
  keywords: string[];
  author: string;
  license: string;
  devDependencies: Record<string, string>;
  exports: string;
  types: string;
  gitHead: string;
  _id: string;
  _nodeVersion: string;
  _npmVersion: string;
  dist: Dist;
  _npmUser: NpmUser;
  maintainers: NpmUser[];
  _npmOperationalInternal: {
    host: string;
    tmp: string;
  };
  _hasShrinkwrap: boolean;
}

export interface Dist {
  integrity: string;
  shasum: string;
  tarball: string;
  fileCount: number;
  unpackedSize: number;
  signatures: Array<{
    keyid: string;
    sig: string;
  }>;
  "npm-signature": string;
}

export interface NpmUser {
  name: string;
  email: string;
}
