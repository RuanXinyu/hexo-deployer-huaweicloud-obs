'use strict';



var obsSync = require('huaweicloud-obs-sync');

module.exports = function (args, callback) {
    var publicDir = this.public_dir;
    var updatedFileList = [];
    var deletedFileList = [];

    if (!args.server || !args.bucket || !args.accessKeyId || !args.secretAccessKey) {
        var help = [
            'You should argsure deployment settings in _config.yml first!',
            '',
            'Example:',
            '  deploy:',
                'type: "huaweicloud-obs"',
                'server : "https://obs.cn-north-1.myhwclouds.com"',
                'bucket: "obs-2f97"',
                'accessKeyId: "R7DYQD3DQRRLTDWYttE3S"',
                'secretAccessKey: "TERHf0NGpDrbhsbc1h3xymB9w22wK8lLgOhdgFkgjCB2"',
                'localFilesIgnorePattern: "^\\..*"',
                'remoteDir: "/"',
                'syncDeletedFiles: "yes"',
                'syncDeletedFilesIgnorePattern: "^\\..*"',
            '',
            'For more help, you can check the docs: http://hexo.io/docs/deployment.html and https://support.huaweicloud.com/bestpractice-obs/obs_05_0620.html'
        ];
        console.log(help.join('\n'));
        console.error('=====> config error');
        return;
    }
    
    return obsSync.syncFolderToOBS({
        server : args.server,
        bucket: args.bucket,
        accessKeyId: args.accessKeyId,
        secretAccessKey: args.secretAccessKey,
        localDir: this.public_dir,
        localFilesIgnorePattern: args.localFilesIgnorePattern == undefined ? "^\\..*" : args.localFilesIgnorePattern,
        remoteDir: args.remoteDir == undefined ? "/" : args.remoteDir,
        syncDeletedFiles: args.syncDeletedFiles == undefined ? "yes" : args.syncDeletedFiles,
        syncDeletedFilesIgnorePattern: args.syncDeletedFilesIgnorePattern == undefined ? "^Blog/.*" : args.syncDeletedFilesIgnorePattern,
    })
};
