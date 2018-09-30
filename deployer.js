'use strict';


var fs = require('fs');
var ObsClient = require('./lib/obs');
var Promise = require('bluebird');
var crypto = require('crypto');
var hexofs = require('hexo-fs');
var urlencode = require('urlencode');
var request = require('request');
var xml2js = require('xml2js');

module.exports = function (args, callback) {
    var publicDir = this.public_dir;
    var updatedFileList = [];
    var deletedFileList = [];

    if (!args.server || !args.bucket || !args.access_key_id || !args.secret_access_key || !args.sync_deleted || !args.obs_dir_prefix) {
        var help = [
            'You should argsure deployment settings in _config.yml first!',
            '',
            'Example:',
            '  deploy:',
            '    type: huaweicloud-obs',
            '    server : <https://yourdomainname>(e.g. https://obs.cn-north-1.myhwclouds.com)',
            '    bucket: <your bucket name>(e.g. obs-2f97)',
            '    obs_dir_prefix: <dir prefix without />(e.g. "")',
            '    access_key_id: <access key>(e.g. R7DYQD3DQRRLTDWYtE3S)',
            '    secret_access_key: <secret access key>(e.g. TERHf0NGpDrbhsbc1h3xymB9w22wK8lLgOFkgjCB2)',
            '    sync_deleted: <yes|no>(e.g. yes)',
            '',
            'For more help, you can check the docs: http://hexo.io/docs/deployment.html and https://support.huaweicloud.com/bestpractice-obs/obs_05_0620.html'
        ];
        console.log(help.join('\n'));
        console.error('=====> config error');
        return;
    }

    args.obs_dir_prefix = args.obs_dir_prefix.replace(/(^\/*)|(\/*$)/g, "").replace(/(^\s*)|(\s*$)/g, "")
    
    let obsClient = new ObsClient({ 
        access_key_id: args.access_key_id, 
        secret_access_key: args.secret_access_key, 
        server : args.server 
    });

    let getOBSFileList = async () => {
        let baseUrl = args.server.replace("https://", "https://" + args.bucket + ".") + "?max-keys=1000&prefix=" + urlencode(args.obs_dir_prefix);
        let marker = "";
        let result = [];
        console.log("get remote obs file list ...");
        while (true) {
            let data = await new Promise((resolver, reject) => {
                let url = marker == "" ? baseUrl : baseUrl + "&marker=" + urlencode(marker);
                console.log(url);
                request(url, (error, response, body) => {
                    if (error) reject(error);
                    xml2js.parseString(body, (error, result) => {
                        resolver(result);
                    });
                });
            });
            if (data.ListBucketResult.Contents != undefined) {
                result = result.concat(data.ListBucketResult.Contents);
            }
            if (data.ListBucketResult.NextMarker == "" || data.ListBucketResult.NextMarker == undefined) {
                break;
            }
            marker = data.ListBucketResult.NextMarker;
        }
        console.log("get remote obs file list success, total file " + result.length);
        return result;
    }

    let uploadFiles = async () => {
        console.log("uploading files ...");
        await Promise.all(updatedFileList.map(function (item) {
            return new Promise((resolver, reject) => {
                obsClient.putObject({ 
                    Bucket : args.bucket, 
                    Key : item.obsKey, 
                    SourceFile : publicDir + item.filename,
                    ContentMD5: item.base64MD5
                }, (err, result) => { 
                    if(err){ 
                        console.error('upload file--> ' + item.obsKey + ', error, ' + err);
                        reject(err);
                    }else{
                        console.error('upload file--> ' + item.obsKey + ', ' + result.CommonMsg.Status);  
                        resolver(result.CommonMsg.Status);
                    } 
                });
            });
        }));
        console.log("uploading files finished...");

        if (args.sync_deleted=="yes") {
            console.log("deleting files ...");
            await Promise.all(deletedFileList.map(function (item) {
                return new Promise((resolver, reject) => {
                    obsClient.deleteObject({ 
                        Bucket : args.bucket, 
                        Key : item.Key[0]
                    }, (err, result) => { 
                        if(err){ 
                            console.error('delete file--> ' + item.Key[0] + ', error, ' + err);
                            reject(err);
                        }else{
                            console.error('delete file --> ' + item.Key[0] + ', response code: ' + result.CommonMsg.Status); 
                            resolver(result.CommonMsg.Status);
                        } 
                    });
                });
            }));
            console.log("deleting files finished...");
        }
        obsClient.close();
        console.log("=================sync files finished================================");
    }

    return getOBSFileList().then(remoteFileList => {
        console.log("=================sync files start================================");
        console.log("get local file list ...");
        let localFileList = hexofs.listDirSync(publicDir).map(item => {
            let data = fs.readFileSync(publicDir + item);
            let result = {
                filename: item, 
                obsKey: args.obs_dir_prefix == "" ? item.replace(/\\/g, "/") : args.obs_dir_prefix + "/" + item.replace(/\\/g, "/"),
                md5: crypto.createHash('md5').update(data).digest('hex'),
                base64MD5: crypto.createHash('md5').update(data).digest("base64")
            };
            return result;
        })
        console.log("get local file list success, total file " + localFileList.length);
    
        console.log("calculate changed local file list ...");
        for (var i = 0; i < localFileList.length; i++) {
            let isUpdated = true;
            for (var j = 0; j < remoteFileList.length; j++) {
                if (remoteFileList[j].Key[0] == localFileList[i].obsKey) {
                    if (remoteFileList[j].ETag[0].replace(/"/g, "") == localFileList[i].md5) {
                        isUpdated = false;
                    }
                    break;
                }
            }
            if (isUpdated) {
                updatedFileList.push(localFileList[i]);
            }
        }
        console.log("calculate changed local file list success, total changed file " + updatedFileList.length);
    
        console.log("calculate deleted local file list ...");
        for (var i = 0; i < remoteFileList.length; i++) {
            let isExist = false;
            for (var j = 0; j < localFileList.length; j++) {
                if (remoteFileList[i].Key[0] == localFileList[j].obsKey) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                deletedFileList.push(remoteFileList[i]);
            }
        }
        console.log("calculate deleted local file list success, total changed file " + deletedFileList.length);
    }).then(uploadFiles);
};
