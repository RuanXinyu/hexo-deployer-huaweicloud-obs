# hexo-deployer-huaweicloud-obs

Huaweicloud obs deployer plugin for [Hexo](http://hexo.io/).

## Installation

``` bash
$ npm install hexo-deployer-huaweicloud-obs --save
```

## Options

You can configure this plugin in `_config.yml`. If `sync_deleted` is set to `yes`, the obs files while not in local directory will be deleted. 

``` yaml
# You can use this:
deploy:
  type: huaweicloud-obs
  server : <https://yourdomainname>(e.g. https://obs.cn-north-1.myhwclouds.com)
  bucket: <your bucket name>(e.g. obs-2f97)
  obs_dir_prefix: <dir prefix without />(e.g. "")
  access_key_id: <access key>(e.g. R7DYQD3DQRRLTDWYtE3S)
  secret_access_key: <secret access key>(e.g. TERHf0NGpDrbhsbc1h3xymB9w22wK8lLgOFkgjCB2)
  sync_deleted: <yes|no>(e.g. yes)
```

## Release Log

## Known Issues

Huaweicloud obs only finds `index.html` in root. This is [detail](https://support.huaweicloud.com/bestpractice-obs/obs_05_0620.html)

So you must set full url in your hexo blog codes like `/archives/index.html` except the root path.