import got, { OptionsOfJSONResponseBody } from "got";
import { NpmPackage, NPMFiles, GitHubFiles } from "./types";

interface GetOption {
	header: Record<string, string>;
}

const header = {
	"User-Agent":
		"Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1",
};

const get = async <T>(url: string, option?: GetOption): Promise<T> => {
	const initOpt: OptionsOfJSONResponseBody = {
		retry: {
			limit: 3,
		},
		headers: option?.header,
	};
	return got.get<T>(url, initOpt).json<T>();
};

/**
 * Get the package details, the latest version is in the dist-tags.latest
 */
export function getNpmPackageInfo(name: string) {
	return get<NpmPackage>(`https://registry.npmjs.org/${name}`);
}

/**
 * Get the file details
 */
export function getNpmPackageFiles(name: string, version: string) {
	return get<NPMFiles>(
		`https://www.npmjs.com/package/${name}/v/${version}/index`
	);
}

/**
 * Get the file details
 */
export function getNpmPackageFile(name: string, fileId: string) {
	return get<string>(`https://www.npmjs.com/package/${name}/file/${fileId}`);
}

export function getGitHubFiles(repo: string, dir?: string) {
	const url =
		"https://api.github.com" +
		`/repos/${repo}/contents${dir ? `/${dir}` : ""}`;
	return get<GitHubFiles[]>(url, { header });
}

export async function getGitHubFile(
	repo: string,
	file: string
): Promise<string> {
	const metaURL =
		"https://api.github.com" + `/repos/${repo}/contents/${file}`;
	const meta = await get<{ download_url: string }>(metaURL, { header });
	return get(meta.download_url);
}
