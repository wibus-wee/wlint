export interface Iminimist {
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

	_?: string[]; // the rest of the arguments
}
