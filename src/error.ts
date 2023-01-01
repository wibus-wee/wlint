import { red } from "kolorist";

/**
 * A function that console errors
 * @param message - The message to log
 * @param exit - Whether to exit the process
 */
export function boom(message: string, exit = true) {
	console.error(`${red("✖")} ${message}`);
	if (exit) process.exit(1);
}

export function promptsOnCancel() {
	boom("Operation cancelled");
}
