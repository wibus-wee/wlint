<div align="center">
<a href="https://github.com/wibus-wee/wlint#gh-light-mode-only">
<img src="https://user-images.githubusercontent.com/62133302/210071391-1a4d1e89-1a2e-4ef1-938c-4369397a7e89.png" />

</a>

<a href="https://github.com/wibus-wee/wlint#gh-dark-mode-only">
<img src="https://user-images.githubusercontent.com/62133302/210071466-38197cce-8dbf-4a7a-b041-f5aa0e9c521d.png" />
</a>
</div>

wlint is a cli to config your project lint quickly. **Just enter `wlint`**, wlint will automatically grab the appropriate lint configuration file, and automatically install the dependencies.

wlint can automatically analyze the dependencies in the project and automatically match the config category. (see [Automatic matching category](#automatic-matching-category)) For example, you can automatically match react configuration if you have react package.

## Features

- ⛏️ [Linter Configs Support](#linter-configs-support)
- 😄 [Linter Packages Auto Install](#linter-packages-auto-install)
- 🌮 [Packages Alias](#packages-alias)
- 🤖️ [Quickly Lint](#quickly-lint)
- 🔧 [Automatic Update Linters](#automatic-update-linters)
- 🍰 [Linter Config Category](#config-category)
- 🚀 [Automatic matching category](#automatic-matching-category)
- 🎉 [Custom Linter Configs Origin](#custom-linter-configs-origin)
- 🎁 [Custom Command Alias Support](#custom-command-alias-support)
- 🎨 [User Config Support](#user-config-support)
- 📦 [Repository Config Support](#repository-config-support)
- 📝 [Origin Config Support](#origin-config-support)

## Install

```bash
npm i -g wlint
```

## Usage

```bash
wlint # Quickly config your project linters.
wlint -c <category> # Use the config in the category
```

## Linter Configs Support

- [x] ESLint (eslint.json)
- [x] Stylelint (stylelint.json)
- [x] Prettier (prettier.json)
- [x] Commitlint (commitlint.json)

### Special Linting Config

#### Prettier

Normally, if we want to use [Prettier Sharing configurations](https://prettier.io/docs/en/configuration.html#sharing-configurations), we can write like this:

```js
module.exports = {
  ...require("@xxx/prettier-config-xxx"),
};
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

If you want to learn more about the `config.json` file, please see the [Origin Config Support](#origin-config-support) section.

## Linter Packages Auto Install

wlint will automatically install the linter config package according to the linter config file. And you don't need to install the linter config package by yourself, wlint will analyze which package you need to install, and then install it automatically.

If the package has alias, you should configure the alias in `config.json` file (see [Packages Alias](#packages-alias) section).

## Quickly Lint

You can quickly lint your project by running the following command: **(Make sure you have installed the linter by `wlint`)**

```bash
wlint lint
```

`wlint` will automatically lint your project according to linter config. If you want to fix the linting errors, you can run the following command:

```bash
wlint lint fix
```

> But make sure you have installed the linter by `wlint`, you have better don't install the linter by yourself. It maybe cause some problems.

## Automatic Update Linters

After init linters with `wlint`, you can use the following command to update the linters config:

```bash
wlint update
```

Then wlint will automatically update the linters config and install the latest linters config package.

This feature is provided by `.wlintrc` file, if you want to learn more about `.wlintrc` file, please see the [Repository Config Support](#repository-config-support) section.

## Custom Linter Configs Origin

You can create your own config origin, and you can also use the config origin that others have created.

### Create Your Own Config Origin

1. Create a new repository on GitHub, and create a linter config file in the root directory of the repository, such as: `eslint.json`, `prettier.json`. Please follow the name rules in the [Linters Config Support](#linters-config-support) section.
2. Go to your shell and run the following command:

```bash
wlint origin add <your config origin repository name>
# wlint origin add wibus-wee/wlint-config
# or you can use npm package name (if you have published your config to npm)
# wlint origin add @wibus-wee/wlint-config

# If you want to remove the config origin, you can run the following command:
wlint origin remove <your config origin repository name>
# wlint origin remove wibus-wee/wlint-config
# wlint origin remove @wibus-wee/wlint-config
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

- [nextjs](https://nextjs.org/) - next
- [react](https://reactjs.org/) - react
- [vue](https://vuejs.org/) - vue
- [jwcjs](https://jwc.js.org/) - jwcjs
- [angular](https://angular.io/) - angular

You can configure the automatic matching category in the `config.json` file in the **root directory** of the project:

```json5
{
  categories: {
    react: ["react", "react-dom", "next"],
  },
}
```

In default, wlint will match the `nextjs` category if the project has `next` package. But in the above example, wlint will match the `react` category if the project has `next` package.

If you want to learn more about the `config.json` file, please see the [Origin Config Support](#origin-config-support) section.

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

`wlint` have a repository config file called `.wlintrc`, you can configure the wlint some behaviors in the `.wlintrc` file.

But in common, you have no need to **(have better not)** configure the .wlintrc file, because wlint will automatically configure the .wlintrc file according to the project. If you setup the `.wlintrc` file but add the wrong configuration, wlint will warn you when you use wlint.

When you init linter with lint, wlint will automatically record the config origin and some other information in the `.wlintrc` file.

```json5
{
  origin: "wibus-wee/wlint-config",
  category: "nextjs",
}
```

For example, you can use `wlint update` command to update the linters. Learn more about the command, please see the [Automatic Update Linters](#automatic-update-linters) section.

## Origin Config Support

`wlint` have a origin config file to configure the linter config, it provides a more flexible configuration method. For example, you can configure [package alias](#custom-linting-config-support) and [automatic matching category](#automatic-matching-category) in the origin config file.

You should create a `config.json` file in the root directory of your project, and then you can configure the origin config in the `config.json` file. For example:

```json5
{
  aliases: {
    // package aliases
    "prettier-config-akrc": "@akrc/prettier-config",
  },
  categories: {
    // custom category matching names
    react: ["react", "react-dom", "next"],
  },
}
```

Now wlint supports the following configuration items:

- **aliases**: [package alias](#packages-alias)
- **categories**: [custom category matching names](#automatic-matching-category)

## Maintainers

<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://iucky.cn"><img src="https://avatars.githubusercontent.com/u/62133302?v=4?s=100" width="100px;" alt="Wibus"/><br /><sub><b>Wibus</b></sub></a></td>
      <td align="center"><a href="https://akr.moe"><img src="https://avatars.githubusercontent.com/u/85140972?v=4?s=100" width="100px;" alt="AkaraChen"/><br /><sub><b>AkaraChen</b></sub></a></td>
    </tr>
  </tbody>
</table>

## License

This project open source under the [MIT License](https://opensource.org/licenses/MIT).

## Author

wlint © Wibus, Released under the MIT License.

> [Personal Website](http://iucky.cn/) · [Blog](https://blog.iucky.cn/) · GitHub [@wibus-wee](https://github.com/wibus-wee/) · Telegram [@wibus✪](https://t.me/wibus_wee)
