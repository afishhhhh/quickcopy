# quickcopy

为什么写了这个工具：[一套代码发布多个微信小程序的实践](https://github.com/afishhhhh/blog/issues/12)

- [x] Taro v2.x

- [x] 微信小程序

## 安装

```
npm install github:afishhhhh/quickcopy --save-dev
```

根据自己的需要在 _package.json_ 的 `scripts` 中写入：

```json
"copy": "qc copy",
"prep": "qc prep",
"sync": "qc sync",
"rm": "qc rm"
```

## 如何使用

在复制新项目之前，我们需要对 **Taro 编译配置文件** (_config/index.js_) 进行一定的改造，在[这篇文章](https://github.com/afishhhhh/blog/issues/12)里列出了改造要点。

### copy 指令

这个指令用于复制出一个新的项目。主要行为包括：

1. 在 _config_ 目录下创建 **项目专属配置目录**；

2. 以 _config/index.js_ 为模版，在 **项目专属配置目录** 下创建新项目的 **Taro 编译配置文件**；

3. 以根目录 _project.config.json_ 为模版，在 **项目专属配置目录** 下创建新项目的 **小程序项目配置文件**；

4. 为新项目创建 **主题样式文件**，并全局注入。

在项目根目录执行：

```
npm run copy -- [projectname] [appid]
```

### prep 指令

用于指定准备编译的项目，并做一些准备工作，随后就可执行编译。主要行为包括：

1. 在 _config_ 目录下创建文件 _build.export.js_，用于导出项目的 **Taro 编译配置**（需要手动在 _config/index.js_ 进行一次 `merge`）；

2. 复制项目的 **小程序项目配置文件** 至根目录。

在项目根目录执行：

```
npm run prep -- [projectname]
```

执行完成后就可以执行 **Taro 编译指令**。

### sync 指令

根目录 _project.config.json_ 中的配置可能会被修改，该指令用于同步 **根目录** 与 **项目专属配置目录** 下 _project.config.json_ 的内容。

在项目根目录执行：

```
npm run sync
```

#### 参数 all

将根目录 _project.config.json_ 同步至所有项目。

```
npm run sync -- --all
```

### rm 指令

用于删除一个项目。

```
npm run rm -- [projectname]
```

### plugin-copy-assets

这是一个 **Taro 插件**，在[这篇文章](https://github.com/afishhhhh/blog/issues/12)里介绍了这个插件的使用场景。从 **Taro 2.2** 开始支持。