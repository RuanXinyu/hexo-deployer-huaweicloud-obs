'use strict';

var pathFn = require('path'),
    fs = require('hexo-fs'),
    ObsClient = require('./lib/obs'),
    Promise = require('bluebird'),
    chalk = require('chalk');

module.exports = function (args, callback) {
    var publicDir = this.public_dir,
        log = this.log,
        uploadFileList = [];

    if (!args.server || !bucket || !args.access_key_id || !args.secret_access_key) {
        var help = [
            'You should argsure deployment settings in _config.yml first!',
            '',
            'Example:',
            '  deploy:',
            '    type: huaweicloud-obs',
            '    server : <https://yourdomainname>',
            '    bucket: <yourBucketName>',
            '    access_key_id: <access key>',
            '    secret_access_key: <secret access key>',
            '',
            'For more help, you can check the docs: ' + chalk.underline('http://hexo.io/docs/deployment.html') + ' and ' + chalk.underline('https://support.huaweicloud.com/bestpractice-obs/obs_05_0620.html')
        ];
        console.log(help.join('\n'));
        log.error('config error');
        return;
    }
    
    var obsClient = new ObsClient({ 
           access_key_id: args.access_key_id, 
           secret_access_key: args.secret_access_key, 
           server : args.server 
    }); 
     

    log.info('Uploading files to huaweicloud obs...');

    // get all files sync
    traverseFiles(publicDir, function (file) {
        uploadFileList.push({
            uploadPath: getUploadPath(file, pathFn.basename(publicDir)),
            file: file
        });
    });

    // upload
    return Promise.all(uploadFileList.map(function (item) {
        return obsClient.putObject({ 
                Bucket : args.bucket, 
                Key : item.uploadPath, 
                SourceFile : item.file 
            }, (err, result) => { 
                if(err){ 
                    console.error('Error-->' + err); 
                }else{
                    console.log('Status-->' + result.CommonMsg.Status); 
                } 
            });
     
    })).then(function(){
            obsClient.close();
        });
};

function traverseFiles(dir, handle) {
    var files = fs.listDirSync(dir);
    files.forEach(function (filePath) {
        var absPath = pathFn.join(dir, filePath),
            stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
            traverseFiles(absPath, handle);
        } else {
            handle(absPath);
        }
    });
}

function getUploadPath(absPath, root) {
    var pathArr = absPath.split(pathFn.sep),
        rootIndex = pathArr.indexOf(root);
    pathArr = pathArr.slice(rootIndex + 1);
    return pathArr.join('/');
}
