export function getShell() {
	const { env } = process;
	// eslint-disable-next-line no-prototype-builtins
	const shell = env[env.hasOwnProperty("ZSH_NAME") ? "ZSH_NAME" : "SHELL"];
	return shell.split("/").pop();
}
