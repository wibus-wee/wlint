<div align="center">
<a href="https://github.com/wibus-wee/wlint#gh-light-mode-only">
<img src="https://user-images.githubusercontent.com/62133302/210071391-1a4d1e89-1a2e-4ef1-938c-4369397a7e89.png" />

</a>

<a href="https://github.com/wibus-wee/wlint#gh-dark-mode-only">
<img src="https://user-images.githubusercontent.com/62133302/210071466-38197cce-8dbf-4a7a-b041-f5aa0e9c521d.png" />
</a>
</div>

## Feature

- ⛏️ [Linting Config Support](#linting-config-support)
- 😄 Linting Config Auto Install
- 🤖️ [Quickly linting](#quickly-linting)
- 🍰 [Linting Config Category](#config-category)
- 🚀 [Automatic matching category](#automatic-matching-category)
- 🎉 [Custom Linting Config Support](#custom-linting-config-support)
- 🎁 [Custom Command Alias Support](#custom-command-alias-support)
- 🎨 [User Config Support](#user-config-support)
- 📦 [Repository Config Support](#repository-config-support)

## Install

```bash
npm i -g wlint
```

## Usage

```bash
wlint # Quickly start linting
wlint -c <category> # Use the config in the category
```

## Linting Config Support

- [x] ESLint (eslint.json)
- [ ] Stylelint (stylelint.json)
- [x] Prettier (prettier.json)
- [ ] Commitlint (commitlint.json)

### Special Linting Config

#### Prettier

Normally, if we want to use [Prettier Sharing configurations](https://prettier.io/docs/en/configuration.html#sharing-configurations), we can write like this:

```js
module.exports = {
  ...require('@xxx/prettier-config-xxx'),
}
```

But in wlint, we should use `json` format, and the `require` function is not supported in `json` format, so we need to use the following format:

```json
{
  "extends": ["@xxx/prettier-config-xxx"]
}
```

Then wlint will automatically install the `prettier-config-xxx` package and use it as the Prettier Config.

#### Packages Alias

Sometimes the package name in `require` is not the same as the package name in npm, so we need to configure the alias in `config.json`:

```json
{
  "aliases": {
    "prettier-config-akrc": "@akrc/prettier-config"
  }
}
```

Save the above configuration in the `config.json` file in the **root directory** of the project, and then `wlint` will automatically scan the package list and install the right package according to the alias. 

Above is the example of `eslint-config-xxx`, and the `eslint-config-xxx` package is actually `@xxx/eslint-config-xxx` in npm. And actually wlint will install `@xxx/eslint-config-xxx` package.

If you want to learn more about the `config.json` file, please see the [Repository Config Support](#repository-config-support) section.

## Quickly linting

You can quickly lint your project by running the following command:

```bash
wlint lint
```

`wlint` will automatically lint your project according to linter config.

> But make sure you have installed the linter by `wlint`, you have better don't install the linter by yourself. It maybe cause some problems.

If your projects have not been initialized, `wlint` will automatically initialize your project linting config.

## Custom Linting Config Support

You can create your own config origin, and you can also use the config origin that others have created.

### Create Your Own Config Origin

1. Create a new repository on GitHub, and create a linter config file in the root directory of the repository, such as: `eslint.json`, `prettier.json`. Please follow the name rules in the [Linting Config Support](#linting-config-support) section.
2. Go to your shell and run the following command:

```bash
wlint origin add <your config origin repository name>
# wlint origin add wibus-wee/wlint-config-origin
# or you can use npm package name (if you have published your config to npm)
# wlint origin add @wibus-wee/wlint-config-origin

# If you want to remove the config origin, you can run the following command:
wlint origin remove <your config origin repository name>
# wlint origin remove wibus-wee/wlint-config-origin
# wlint origin remove @wibus-wee/wlint-config-origin
```
3. Then you can use your config origin in your project!

### Config Category

You can create a category for your config origin, and you can also use the category that others have created.

1. Create a new repository on GitHub, and create a category directory in the root directory of the repository, such as: `default`, `nextjs`, `react`.
2. Follow the steps in the [Create Your Own Config Origin](#create-your-own-config-origin) section to create your own config origin.
3. Then you can use your config origin in your project like this:

```bash
wlint -c <your category name>
# wlint -c nextjs
# wlint --category nextjs
```

### Automatic matching category

If you don't specify the category, `wlint` will automatically match the category according to the project type. `wlint` will analyze the project package.json file, and then match the category according to the `dependencies` and `devDependencies` fields.

```json
{
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "devDependencies": {
    "next": "^11.0.1"
  }
}
```

In the above example, `wlint` will automatically match the `nextjs` category. If `nextjs` category does not exist, `wlint` will try to match the `react` category, and so on.

You should open the `autoMatch` option in wlint config to enable the automatic matching category. 

```bash
wlint config set autoMatch true
```

If you want to learn more about wlint config, you can see the [User Config Support](#user-config-support) section.

Now `wlint` supports the following categories to be automatically matched:

- [nextjs](https://nextjs.org/)
- [react](https://reactjs.org/)
- [vue](https://vuejs.org/)
- [jwcjs](https://jwc.js.org/)

You can configure the automatic matching category in the `config.json` file in the **root directory** of the project:

```json
{
  "category": { // custom category matching name
    "react": ["react", "react-dom", "next"]
    // if the project has react / react-dom / next package, wlint will match the `react` category
  }
}
```

If you want to learn more about the `config.json` file, please see the [Repository Config Support](#repository-config-support) section.

## Custom Command Alias Support

By default, `wlint` only provides the `wlint` for bin, but you can also add your own command alias. **(Only for Linux and macOS)**

```bash
wlint alias add <your command alias>
# wlint alias add ww
```

Then you can use your command alias in your project! If you want to delete your command alias, you can run the following command:

```bash
wlint alias remove <your command alias>
# wlint alias remove ww
```

**But, please don't modify the alias of the `wlint` command, or you should also delete the alias config in the `~/.config/.wlintrc.json` file.**

## User Config Support

`wlint` have a user config file, you can use the following command to edit the user config file:

```bash
wlint config [set|get|remove] <key> [value]
```

Command alias, automatic matching category and some features are all configured in the user config file.

```bash
# if you want to use `config set` to setup alias
wlint config set alias ww
# same as `wlint alias add ww`
wlint config remove alias ww
# same as `wlint alias remove ww`

# if you want to use `config set` to setup automatic matching category
wlint config set autoMatch true
wlint config remove autoMatch
```

## Repository Config Support

`wlint` have a repository config file to configure the linter config, for example: `package alias`, `custom category matching name`... It provides a more flexible configuration method.

You should create a `config.json` file in the root directory of your project, and then you can configure the repository config in the `config.json` file. For example:

```json5
{
  "aliases": { // package alias
    "prettier-config-akrc": "@akrc/prettier-config"
  },
  "category": { // custom category matching name
    "react": ["react", "react-dom", "next"]
  }
}
```

## License

This project AGPLv3 license open source, the use of this project for secondary creation or derivative projects must also be open source.

## Author

wlint © Wibus, Released under the AGPL-3.0 License. 

> [Personal Website](http://iucky.cn/) · [Blog](https://blog.iucky.cn/) · GitHub [@wibus-wee](https://github.com/wibus-wee/) · Telegram [@wibus✪](https://t.me/wibus_wee)
