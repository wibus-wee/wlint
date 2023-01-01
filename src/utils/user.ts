export function getUserHome() {
	return process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
}
