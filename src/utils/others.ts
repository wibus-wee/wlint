import { boom } from "../error";

export function transformValue(value: any) {
	if (typeof value === "string") {
		try {
			return JSON.parse(value);
		} catch (error) {
			return value;
		}
	}
	return value;
}

export function getShell(): string {
	const { env } = process;
	const path = "ZSH_NAME" in env ? "ZSH_NAME" : "SHELL";
	const shell = env[path];
	if (!shell) {
		boom("Unable to detect shell, are you sure you are using a shell?");
		return ""; // unreachable, but needed for type checking
	}
	return shell.split("/").pop()!;
}
