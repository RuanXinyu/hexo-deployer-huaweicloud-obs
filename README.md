# hexo-deployer-huaweicloud-obs

Huaweicloud obs deployer plugin for [Hexo](http://hexo.io/).

## 特性说明

1. 支持增量同步本地文件目录到华为云OBS文件夹
1. 支持设置是否同步删除OBS文件和目录
1. 支持指定OBS同步目录
1. 支持设置本地过滤文件和OBS过滤文件

## 安装

``` bash
$ npm install hexo-deployer-huaweicloud-obs --save
```

## Options

首先在 `_config.yml`做如下的配置：

``` yaml
deploy:
  type: "huaweicloud-obs"
  server : "https://obs.cn-north-1.myhwclouds.com"
  bucket: "obs-2f97"
  accessKeyId: "R7DYQD3DQRRLTDWYttE3S"
  secretAccessKey: "TERHf0NGpDrbhsbc1h3xymB9w22wK8lLgOhdgFkgjCB2"
  localFilesIgnorePattern: "^\\..*"
  remoteDir: "/"
  syncDeletedFiles: "yes"
  syncDeletedFilesIgnorePattern: "^\\..*"
```

| 名称 | 必选 | 默认值 | 描述 |
| -- | -- | -- |-- |
| server | 必填 | null | OBS服务器地址，以`https://`开头，不包含桶名称 <br>比如`https://obs.cn-north-1.myhwclouds.com` |
| bucket |必填 | null | OBS桶名称 |
| accessKeyId | 必填 | null | 访问OBS的accessKeyId |
| secretAccessKey | 必填 | null | 访问OBS的secretAccessKey |
| localFilesIgnorePattern | 可选 | "^\\..*" | 本地忽略文件的正则表达式 <br>与文件相对于`public`的相对路径相匹配，路径分隔符为`/` <br> 比如： `img/avast.png` |
| remoteDir | 可选 | / | 同步到远端的目录，路径分隔符为`/` |
| syncDeletedFiles | 可选 | yes | `yes`或者`no`, 除`syncDeletedFilesIgnorePattern`匹配上的文件外 <br>如果是`yes`，则本地文件删除后，OBS中的文件也会对应删除 |
| syncDeletedFilesIgnorePattern | 可选 | "^\\..*" | 远端忽略文件的正则表达式 <br>与文件相对于`remoteDir`的相对路径相匹配，路径分隔符为`/` <br> 比如： `img/avast.png` |
