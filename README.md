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

Sometimes the package name in `require` is not the same as the package name in npm, so we need to configure the alias in `alias.json`:

```json
{
  "eslint-config-xxx": "@xxx/eslint-config-xxx"
}
```

Save the above configuration in the `alias.json` file in the **root directory** of the project, and then `wlint` will automatically scan the package list and install the right package according to the alias. 

Above is the example of `eslint-config-xxx`, and the `eslint-config-xxx` package is actually `@xxx/eslint-config-xxx` in npm. And actually wlint will install `@xxx/eslint-config-xxx` package.

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
wlint config add <your config origin repository name>
# wlint config add wibus-wee/wlint-config-origin
# or you can use npm package name (if you have published your config to npm)
# wlint config add @wibus-wee/wlint-config-origin
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

In the above example, `wlint` will automatically match the `nextjs` category. (if exists) Now `wlint` supports the following categories to be automatically matched:

- [nextjs](https://nextjs.org/)
- [react](https://reactjs.org/)
- [vue](https://vuejs.org/)
- [jwcjs](https://jwc.js.org/)

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


## License

This project AGPLv3 license open source, the use of this project for secondary creation or derivative projects must also be open source.

## Author

wlint © Wibus, Released under the AGPL-3.0 License. 

> [Personal Website](http://iucky.cn/) · [Blog](https://blog.iucky.cn/) · GitHub [@wibus-wee](https://github.com/wibus-wee/) · Telegram [@wibus✪](https://t.me/wibus_wee)
