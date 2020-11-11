# quickcopy

为什么写了这个工具：[一套代码发布多个微信小程序的实践](https://github.com/afishhhhh/blog/issues/12)

Taro：
- [x] v2.x

小程序：
- [x] 微信

### 安装

```
npm install
```

### 如何使用

#### copy 指令

`qc copy [projectname] [appid]`

以原项目为模版生成以下内容：

1. Taro 编译配置

#### Taro 编译配置文件

以 _config/index.js_ 为模版，创建新的编译配置文件，路径为 _config/config-projectname/index.js_，包括 `projectName`、`outputRoot`、`defineConstants`、`copy.patterns` 以及 `sass.resource`。

1. `projectName` 的值为命令行传入的 `projectname` 参数
2. `outputRoot` 为 `dist-projectname`，也就是说如果有多个项目就会生成多个 _dist_ 目录
3. 找到 `__XX` 形式的常量，生成新的 `defineConstants`
4. 找到 `patterns` 中的所有 `to` 属性，将 _dist_ 目录修改为 _dist-projectname_
5. 在 `resource` 中全局注入主题样式文件

#### 项目配置文件

以根目录 _project.config.json_ 为模版，创建新的项目配置文件，路径为 _config/config-projectname/project.config.json_。除了 `miniprogramRoot`、`projectname` 以及 `appid` 被修改为新的项目，其余均保持不变。

#### 主题样式文件

以 _src/style_、_src/styles_ 以及 _src/css_ 为顺序查找 _src_ 目录下是否存在样式文件夹，如果存在，则在对应目录下创建 _themes/project.scss_ 主题样式文件，如果以上几个目录都不存在，则默认在 _src/style_ 下创建。

### prep

`qc prep [projectname]`

执行编译前的准备工作。

1. 将 _config/config-projectname_ 下的 _project.config.json_ 文件复制到根目录。比较两个文件的最近修改时间来决定是否覆盖
2. 在 _config_ 目录下创建 _build.export.js_ 文件，导出项目编译配置
3. 在 _config/index.js_ 最后合并 `require('./build.export.js')`

### sync

`qc sync`

同步根目录 _project.config.json_ 和项目配置目录下 _project.config.json_ 的内容。参数 `--all` 决定是否以根目录为模版更新所有的 _project.config.json_。

Taro 2.2.13
新增页面
根据 `__PROJECT` 打包某些项目特有的页面。
1. `./src touch appConfig.js`
2. `const project = __PROJECT`
3. `preval.require('./appConfig', project, 'pages')`

TabBar icon
1. 在存放 icon 的文件夹同级目录下创建以 icon-project 为名的文件夹
2. 使用 Taro 插件，在 `config/index.js plugins` 中引入
3. icon-project 中存在同名 icon 则覆盖
4. 不需要根据不同项目来修改 `tabBar` 引用的资源
5. 其他页面引用的资源？

创建 Theme
1. 判断 src/style, src/styles, src/css
2. 没有全局注入，创建 src/style/themes/project.scss，自动全局注入，可能被已存在的 `@import` 覆盖
3. 已存在全局注入，在 `resource` 第一个自动注入
4. less

page 差异
