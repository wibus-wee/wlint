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
