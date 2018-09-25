# hexo-deployer-huaweicloud-obs

Huaweicloud obs deployer plugin for [Hexo](http://hexo.io/).

## Installation

``` bash
$ npm install hexo-deployer-huaweicloud-obs --save
```

## Options

You can configure this plugin in `_config.yml`.

``` yaml
# You can use this:
deploy:
  type: 'huaweicloud-obs',
  server : 'https://yourdomainname',
  bucket: "<yourBucketName>",
  access_key_id: '*** Provide your Access Key ***',
  secret_access_key: '*** Provide your Secret Key ***',
```

## Known Issues

Huaweicloud obs only finds `index.html` in root. This is [detail](https://support.huaweicloud.com/bestpractice-obs/obs_05_0620.html)

So you must set full url in your hexo blog codes like `/archives/index.html` except the root path.