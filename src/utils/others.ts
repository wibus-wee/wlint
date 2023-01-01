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

export function parseConfigKeys(keys: string[]) {
	const configKeys = keys.map((key) => {
		const [k, t] = key.split(":");
		return {
			key: k.replace("?", ""),
			type: t,
			optional: k.includes("?"),
		};
	});
	return configKeys;
}

export function argsx(...args: any[]) {
	const result: string[] = [];
	args.forEach((arg) => {
		if (typeof args === "string") {
			result.push(arg);
		} else if (Array.isArray(arg)) {
			result.push(...argsx(arg));
		} else {
			for (const key in arg) {
				const value = arg[key];
				if (value) result.push(key);
			}
		}
	});
	return result;
}
