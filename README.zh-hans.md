<div align="center">
<a href="https://github.com/wibus-wee/wlint#gh-light-mode-only">
<img src="https://user-images.githubusercontent.com/62133302/210071391-1a4d1e89-1a2e-4ef1-938c-4369397a7e89.png" />

</a>

<a href="https://github.com/wibus-wee/wlint#gh-dark-mode-only">
<img src="https://user-images.githubusercontent.com/62133302/210071466-38197cce-8dbf-4a7a-b041-f5aa0e9c521d.png" />
</a>

[English](./README.md) | 简体中文

</div>

wlint 是一个用于快速配置项目 lint 的命令行工具。**只需输入 `wlint`**，wlint 将自动获取适当的 lint 配置文件，并自动安装依赖项。

wlint 可以自动分析项目中的依赖项，并自动匹配配置类别（详见[自动匹配类别](#自动匹配类别)）。例如，如果项目中安装了 react 包，它可以自动匹配 react 的配置。

## 特点

- ⛏️ [支持 Linter 配置](#支持的-linter-配置)
- 😄 [自动安装 Linter 包](#自动安装-linter-包)
- 🌮 [包别名](#包别名)
- 🤖️ [快速进行代码检查](#快速进行代码检查)
- 🔧 [自动更新 Linter](#自动更新代码检查工具)
- 🍰 [Linter 配置类别](#配置类别)
- 🚀 [自动匹配类别](#自动匹配类别)
- 🎉 [自定义 Linter 配置源](#自定义代码检查工具配置源)
- 🎁 [自定义命令别名支持](#自定义命令别名支持)
- 🎨 [用户配置支持](#用户配置支持)
- 📦 [仓库配置支持](#仓库配置支持)
- 📝 [源配置支持](#源配置支持)

## 安装

```bash
npm i -g wlint
```

## 使用方法

```bash
wlint # 快速配置项目的代码检查工具。
wlint -c <category> # 使用指定类别的配置
```

## 支持的 Linter 配置

- [x] ESLint（eslint.json）
- [x] Stylelint（stylelint.json）
- [x] Prettier（prettier.json）
- [x] Commitlint（commitlint.json）

### 特殊的代码检查配置

#### Prettier

通常情况下，如果我们想使用[Prettier 共享配置](https://prettier.io/docs/en/configuration.html#sharing-configurations)，我们可以这样写：

```js
module.exports = {
  ...require("@xxx/prettier-config-xxx"),
};
```

但是在 wlint 中，我们需要使用 `json` 格式，并且 `json` 格式不支持 `require` 函数，所以我们需要使用以下格式：

```json
{
  "extends": ["@xxx/prettier-config-xxx"]
}
```

然后 wlint 将自动安装 `prettier-config-xxx` 包并将其用作 Prettier 配置。

#### 包别名

有时，`require` 中的包名称与 npm 中的包名称不一致，因此我们需要在 `config.json` 中配置别名：

```json
{
  "aliases": {
    "prettier-config-akrc": "@akrc/prettier-config"
  }
}
```

将上述配置保存在项目的**根目录**下的 `config.json` 文件中，然后 `wlint` 将自动扫描包列表，并根据别名安装正确的包。

上述示例是针对 `eslint-config-xxx` 的，实际上 `eslint-config-xxx` 包在 npm 中的名称是 `@xxx/eslint-config-xxx`。wlint 实际上会安装 `@xxx/eslint-config-xxx` 包。

如果您想了解更多关于 `config.json` 文件的信息，请参阅 [原始配置支持](#源配置支持) 部分。

## 自动安装 Linter 包

wlint 将根据代码检查配置文件自动安装相应的代码检查包。您无需手动安装代码检查包，wlint 将分析您需要安装哪个包，然后自动安装它。

如果包有别名，请在 `config.json` 文件中进行配置（参见[包别名](#包别名)部分）。

## 快速进行代码检查

您可以通过运行以下命令快速对项目进行代码检查：**（确保您已通过 `wlint` 安装了代码检查工具）**

```bash
wlint lint
```

`wlint` 将根据代码检查配置自动对项目进行代码检查。如果您希望修复代码检查错误，可以运行以下命令：

```bash
wlint lint fix
```

> 但请确保您已通过 `wlint` 安装了代码检查工具，最好不要自己安装代码检查工具，这可能会导致一些问题。

## 自动更新代码检查工具

在使用 `wlint` 初始化代码检查工具之后，您可以使用以下命令更新代码检查工具配置：

```bash
wlint update
```

然后，`wlint` 将自动更新代码检查工具配置并安装最新的代码检查工具配置包。

该功能由 `.wlintrc` 文件提供支持，如果您想了解更多关于 `.wlintrc` 文件的信息，请参阅 [仓库配置支持](#仓库配置支持) 部分。

## 自定义代码检查工具配置源

您可以创建自己的配置源，也可以使用其他人创建的配置源。

### 创建自定义配置源

1. 在 GitHub 上创建一个新的仓库，并在仓库的根目录中创建一个代码检查配置文件，例如：`eslint.json`、`prettier.json`。请遵循[Linter 配置支持](#支持的-linter-配置)部分中的命名规则。
2. 打开命令行终端，运行以下命令：

```bash
wlint origin add <您的配置源仓库名称>
# wlint origin add wibus-wee/wlint-config
# 或者您也可以使用 npm 包名（如果您已将配置发布到 npm）
# wlint origin add @wibus-wee/wlint-config

# 如果您想删除配置源，可以运行以下命令：
wlint origin remove <您的配置源仓库名称>
# wlint origin remove wibus-wee/wlint-config
# wlint origin remove @wibus-wee/wlint-config
```

3. 然后您就可以在项目中使用您的配置源了！

### 配置类别

您可以为自己的配置源创建一个类别，也可以使用其他人创建的类别。

1. 在 GitHub 上创建一个新的仓库，并在仓库的根目录中创建一个类别目录，例如：`default`、`nextjs`、`react`。
2. 按照 [创建自定义配置源](#创建自定义配置源) 部分的步骤创建自己的配置源。
3. 然后您可以像这样在项目中使用您的配置源：

```bash
wlint -c <您的类别名称>
# wlint -c nextjs
# wlint --category nextjs
```

### 自动匹配类别

如果您没有指定类别，`wlint` 将根据项目类型自动匹配类别。`wlint` 将分析项目的 `package.json` 文件，然后根据 `dependencies` 和 `devDependencies` 字段进行类别匹配。

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

在上面的示例中，`wlint` 将自动匹配 `nextjs` 类别。如果 `nextjs` 类别不存在，`wlint` 将尝试匹配 `react` 类别，以此类推。

您应该在 `wlint` 的配置中打开 `autoMatch` 选项，以启用自动匹配类别。

```bash
wlint config set autoMatch true
```

如果您想了解更多关于 `wlint` 配置的信息，请参阅 [用户配置支持](#用户配置支持) 部分。

现在 `wlint` 支持自动匹配以下类别：

- [nextjs](https://nextjs.org/) - next
- [react](https://reactjs.org/) - react
- [vue](https://vuejs.org/) - vue
- [jwcjs](https://jwc.js.org/) - jwcjs
- [angular](https://angular.io/) - angular

您可以在项目的**根目录**的 `config.json` 文件中配置自动匹配类别：

```json5
{
  categories: {
    react: ["react", "react-dom", "next"],
  },
}
```

默认情况下，如果项目有 `next` 包，`wlint` 将匹配 `nextjs` 类别。但在上面的示例中，如果项目有 `next` 包，`wlint` 将匹配 `react` 类别。

如果您想了解更多关于 `config.json` 文件的信息，请参阅 [原始配置支持](#源配置支持) 部分。

## 自定义命令别名支持

默认情况下，`wlint` 只提供 `wlint` 作为命令别名，但您也可以添加自己的命令别名。**（仅适用于 Linux 和 macOS）**

```bash
wlint alias add <您的命令别名>
# wlint alias add ww
```

然后您就可以在项目中使用您的命令别名了！如果您想删除命令别名，可以运行以下命令：

```bash
wlint alias remove <您的命令别名>
# wlint alias remove ww
```

**但请不要修改 `wlint` 命令的别名，或者您还需要删除 `~/.config/.wlintrc.json` 文件中的别名配置。**

## 用户配置支持

`wlint` 有一个用户配置文件，您可以使用以下命令来编辑用户配置文件：

```bash
wlint config [set|get|remove] <key> [value]
```

命令别名、自动匹配类别和一些功能都是在用户配置文件中进行配置的。

```bash
# 如果您想使用 `config set` 来设置命令别名
wlint config set alias ww
# 等同于 `wlint alias add ww`
wlint config remove alias ww
# 等同于 `wlint alias remove ww`

# 如果您想使用 `config set` 来设置自动匹配类别
wlint config set autoMatch true
wlint config remove autoMatch
```

## 仓库配置支持

`wlint` 提供了一个名为 `.wlintrc` 的仓库配置文件，您可以在 `.wlintrc` 文件中配置 `wlint` 的某些行为。

但通常情况下，您不需要**（最好不要）**配置 `.wlintrc` 文件，因为 `wlint` 会根据项目自动配置 `.wlintrc` 文件。如果您设置了 `.wlintrc` 文件但添加了错误的配置，当您使用 `wlint` 时，`wlint` 会向您发出警告。

当您使用 `lint` 命令初始化代码检查工具时，`wlint` 将自动记录配置源和其他一些信息到 `.wlintrc` 文件中。

```json5
{
  "origin": "wibus-wee/wlint-config",
  "category": "nextjs"
}
```

例如，您可以使用 `wlint update` 命令来更新代码检查工具。要了解更多有关该命令的信息，请参阅 [自动更新代码检查工具](#自动更新代码检查工具) 部分。

## 源配置支持

`wlint` 提供了一个原始配置文件来配置代码检查工具的配置，它提供了更灵活的配置方法。例如，您可以在原始配置文件中配置[包别名](#包别名)和[自动匹配类别](#自动匹配类别)。

您应该在项目的根目录中创建一个 `config.json` 文件，然后您可以在 `config.json` 文件中配置原始配置。例如：

```json5
{
  "aliases": {
    // 包别名
    "prettier-config-akrc": "@akrc/prettier-config"
  },
  "categories": {
    // 自定义类别匹配名称
    "react": ["react", "react-dom", "next"]
  }
}
```

现在，`wlint` 支持以下配置项：

- **aliases**: [包别名](#包别名)
- **categories**: [自定义类别匹配名称](#自动匹配类别)


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

wlint © Wibus & AkaraChen, Released under the MIT License.