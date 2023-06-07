# CHANGELOG

## [0.2.1](https://github.com/wibus-wee/wlint/compare/v0.2.0...v0.2.1) (2023-06-07)


### Bug Fixes

* **matcher:** use incompatible `require` syntax ([bac1e02](https://github.com/wibus-wee/wlint/commit/bac1e023c2bec915feec4d79f8e10b5318468c60))
* **prompts:** remove console log for development ([f38077a](https://github.com/wibus-wee/wlint/commit/f38077ad69eebaef17607df6bd7a1b34563d386b))
* **runtime:** runtime error occurred ([97a93ca](https://github.com/wibus-wee/wlint/commit/97a93ca015f9ff7b2cf736e41c3b46e552bef30c))



# [0.2.0](https://github.com/wibus-wee/wlint/compare/v0.1.0...v0.2.0) (2023-06-07)


### Bug Fixes

* **config:** arg value is optional ([74ccf6b](https://github.com/wibus-wee/wlint/commit/74ccf6bb3b17aa21b35ba1848ef6862d8361d423))
* **deps:** update dependency got to v12.6.1 ([#96](https://github.com/wibus-wee/wlint/issues/96)) ([28c9913](https://github.com/wibus-wee/wlint/commit/28c9913b9ce3b32940f68d271bd23df4847fe984))
* **main:** missing `await` cause wrong execution ([d708e2a](https://github.com/wibus-wee/wlint/commit/d708e2a60e7a09c3b273e2c465a08009018ac3c5))
* prompts message ([3d6f9a4](https://github.com/wibus-wee/wlint/commit/3d6f9a485603b87bddc7ced4353ad0e8815e2da6))
* wrong directory ([c56ab61](https://github.com/wibus-wee/wlint/commit/c56ab61066e45197af355d7d1017dc0e1f79d9ad))


### Features

* generate json file with indentation ([#25](https://github.com/wibus-wee/wlint/issues/25)) ([2c8f59d](https://github.com/wibus-wee/wlint/commit/2c8f59da16a8b0f487edc5b255b629f0515d9648))


### Performance Improvements

* temp config support ([#31](https://github.com/wibus-wee/wlint/issues/31)) ([55bfe32](https://github.com/wibus-wee/wlint/commit/55bfe32c46d4454b151e49f3616b2b2f5bd83f51))
* **unbuild:** remove useless `alias` prop ([4423556](https://github.com/wibus-wee/wlint/commit/44235569c4692c62d9bbae7f478ff433f30ad185))
* **utils:** extended npm package name matching range ([a82b81c](https://github.com/wibus-wee/wlint/commit/a82b81c76f681020b16fe806e1bff43a2ed591f6))



# [0.1.0](https://github.com/wibus-wee/wlint/compare/c2defb9f356a95d735ee27ed4d0adc08e54533f1...v0.1.0) (2023-01-01)


### Bug Fixes

* get user home return undefined ([82f4846](https://github.com/wibus-wee/wlint/commit/82f4846e716a8debd51d41ab3e3bf1cc056cbbd6))
* join space between packages ([35b20a6](https://github.com/wibus-wee/wlint/commit/35b20a64f3bd032251abf6bf8403f510c2ef95f7))
* missing detect pkg manger ([7731282](https://github.com/wibus-wee/wlint/commit/773128207a9dec795f149b324cff2c733a28b538))
* prettier generator add wrong keys ([b9a4b67](https://github.com/wibus-wee/wlint/commit/b9a4b674b861bae2ec5736e1da60f84204186eaa))
* rename originals to origins ([f8dff1e](https://github.com/wibus-wee/wlint/commit/f8dff1e30838825d413e46d1cc69d5902558de49))
* request with header and friendly catch ([cf2d75f](https://github.com/wibus-wee/wlint/commit/cf2d75f657e9478be88a534d5e2f4c1c0e637f5b))
* stringify before parsing ([a50e9ac](https://github.com/wibus-wee/wlint/commit/a50e9ac5373be841b8f4a0a69f4feae0c6c12700))
* support no category stage ([d6ff1ad](https://github.com/wibus-wee/wlint/commit/d6ff1ad3bbd5281016f83f8bb54426db38550445))
* unexpected symbol escape ([8607f8b](https://github.com/wibus-wee/wlint/commit/8607f8bcbbf91619ad916da0e42dfc4a2d2ec345))
* wrong request type ([0bafb99](https://github.com/wibus-wee/wlint/commit/0bafb9913d1df873546b3df4b31bddb1ec4cd426))


### Features

* add stylelint support ([c7ea538](https://github.com/wibus-wee/wlint/commit/c7ea538d4ad682281638186e5fe63ef8b3e8d1c0))
* alias install and uninstall ([c2defb9](https://github.com/wibus-wee/wlint/commit/c2defb9f356a95d735ee27ed4d0adc08e54533f1))
* ask user to use default origin ([3d023d0](https://github.com/wibus-wee/wlint/commit/3d023d0015710af232a7b697692a37b04d067ac1))
* automatic matching linter category ([#13](https://github.com/wibus-wee/wlint/issues/13)) ([aa77912](https://github.com/wibus-wee/wlint/commit/aa77912bf248d19b75e2ff2f3433600bb9f411ce))
* check config file conflicts ([0f5fa2b](https://github.com/wibus-wee/wlint/commit/0f5fa2b2fd1e94ca7bf759d7cc74f1afbf56183d))
* check is npm package or github ([39a6b08](https://github.com/wibus-wee/wlint/commit/39a6b0888ca27f1507085d9f4aa13b7cc4adfc9a))
* commitlint config support ([#17](https://github.com/wibus-wee/wlint/issues/17)) ([8d0f710](https://github.com/wibus-wee/wlint/commit/8d0f7103acd03009e831d9ddc072e91091b91e3a))
* config manager support ([556e785](https://github.com/wibus-wee/wlint/commit/556e785eb71668080035fcacb4e9eb96e0eef5ec))
* improve package name check ([70fb1a9](https://github.com/wibus-wee/wlint/commit/70fb1a96fa3eb4d4cffc0dc53f9dac11581cd0ad))
* lint command ([#21](https://github.com/wibus-wee/wlint/issues/21)) ([148cffd](https://github.com/wibus-wee/wlint/commit/148cffd514c516924df0592c7cfa31929d4c8277))
* linter config updater ([#22](https://github.com/wibus-wee/wlint/issues/22)) ([f9555c3](https://github.com/wibus-wee/wlint/commit/f9555c3a35e847d3dfa705d09568402d16ec3877))
* package alias support ([#9](https://github.com/wibus-wee/wlint/issues/9)) ([0831e4e](https://github.com/wibus-wee/wlint/commit/0831e4ea9f427b45b2c3731fa8836fc61f35abd2))
* record config to wlintrc ([a2089a0](https://github.com/wibus-wee/wlint/commit/a2089a0b62102d356b55bd8a7a99fa6608fd4b13))
* user config setting support ([#11](https://github.com/wibus-wee/wlint/issues/11)) ([791e751](https://github.com/wibus-wee/wlint/commit/791e751baf7bcd69d233f57de477a332b3eb5787))
* validator support validate array ([7a317d5](https://github.com/wibus-wee/wlint/commit/7a317d5a33e740a90b5922a33555847146002d73))
* wlint shell alias support ([#6](https://github.com/wibus-wee/wlint/issues/6)) ([6d2e25d](https://github.com/wibus-wee/wlint/commit/6d2e25d6619a7b78da0afb6ff02121aece29560b))
* wlintrc support with validator ([#20](https://github.com/wibus-wee/wlint/issues/20)) ([b080f1e](https://github.com/wibus-wee/wlint/commit/b080f1e383eba707d223645511da3e7dee11b7c1))


### Performance Improvements

* add category arg short alias ([6c38f86](https://github.com/wibus-wee/wlint/commit/6c38f866dab2a5774b4cb6b1e540e495d2aa8c33))
* add category argv support ([19d0beb](https://github.com/wibus-wee/wlint/commit/19d0beb955b535f92ab5f77050c41a1a091ebdfc))
* config array value ([99e4566](https://github.com/wibus-wee/wlint/commit/99e45665c455d56e861577f62da96e2fb326aa48))
* export wlint config in index ([90dcddc](https://github.com/wibus-wee/wlint/commit/90dcddcba4170ae0a79e7a62bfb86cbfb15ceb1d))
* friendly exit ([41e21be](https://github.com/wibus-wee/wlint/commit/41e21be10a4c3bc8404d82284e26caad2c124089))
* ignore some useless dirs ([93afc05](https://github.com/wibus-wee/wlint/commit/93afc0502b5ee7ec2434be04cfa99242b8d10669))
* install linter core package ([3c31a6d](https://github.com/wibus-wee/wlint/commit/3c31a6d71d0de941d4b3602e3ced5b4ef467450f))
* match react category with only one package ([cb63e25](https://github.com/wibus-wee/wlint/commit/cb63e25d8bdb4b52abb08b2283f81c098727e44b))
* remove useless `[@ts-ignore](https://github.com/ts-ignore)` ([7de9bea](https://github.com/wibus-wee/wlint/commit/7de9beadd39cc6a08d859581353ed08a7a31bd4a))
* rename `origin` method to `origins` ([f9d2802](https://github.com/wibus-wee/wlint/commit/f9d2802c697529bb29b4c505beb4f2afce99c0bb))
* stringify before parsing ([0f8c89d](https://github.com/wibus-wee/wlint/commit/0f8c89d9e86713a7f3f637620ee960b1d78ffcd4))
* use `node:os` to get homedir ([3319f9e](https://github.com/wibus-wee/wlint/commit/3319f9ee8b6392cb44b52b04baf15509a206c808))
* use exists instead of try-catch ([3057f63](https://github.com/wibus-wee/wlint/commit/3057f6313febf88bbdced4a36243f7600d5435bc))
* use origins instead of originals ([ea76fa8](https://github.com/wibus-wee/wlint/commit/ea76fa8e5f380e061859db8b9457df4f9efcdbe0))
* use standalone repo config to setup ([#12](https://github.com/wibus-wee/wlint/issues/12)) ([22854bc](https://github.com/wibus-wee/wlint/commit/22854bcaf92b2d74340ae7201407853a7509b541))



