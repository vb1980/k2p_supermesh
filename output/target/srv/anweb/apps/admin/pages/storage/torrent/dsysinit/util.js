"use strict";!function(){angular.module("app").service("torrentUtil",["funcs","device","devinfo","cpe","translate",function(funcs,device,devinfo,cpe){function push(settings){var data=converter.nativeToDsysinit(settings),diff=funcs.newConfig.makeDiff(__backupTransmission,data,attrs);return _.isEmpty(diff)?Promise.resolve():cpe.ApplyDifference(diff).then(function(){return cpe.GetParameterValues([paths.VALID_STORAGE_PATH]).then(function(response){var data=funcs.buildTree(response.result.ParameterList);return funcs.fetchBranch(data,paths.VALID_STORAGE_PATH)?Promise.resolve():Promise.reject({name:"invalid_usb_path"})})})}function prepare(response,cb){var data;response&&response[paths.USB_STORAGE]&&(data=converter.dsysinitToNative(response[paths.USB_STORAGE]),cb&&cb(data))}function getConfig(){return config}var config=null,attrs=null,__backupTransmission=null,converter=device.torrent.converter,paths={USB_STORAGE:"Device.USB.Storage.",TRANSMISSION:"Device.Services.Transmission.",VALID_STORAGE_PATH:"Device.Services.Transmission.ValidPath",FIREWALL:"Device.Firewall.IPv4.Rules."},configPath=[paths.USB_STORAGE,paths.TRANSMISSION];return{pull:function(){function success(response){var data=funcs.buildTree(response[0].result.ParameterList);return attrs=funcs.buildTreeAttributes(response[1].result.ParameterList),data.Device.Services.Transmission.DefaultPeerNumber=funcs.fetchBranch(attrs,paths.TRANSMISSION+"PeerLimit.default"),config=converter.dsysinitToNative(data),__backupTransmission=funcs.deepClone(funcs.fetchBranch(data,paths.TRANSMISSION)),Promise.resolve()}return Promise.all([cpe.GetParameterValues(configPath),cpe.GetParameterAttributes([paths.TRANSMISSION])]).then(success)},push:push,refreshStorage:function(cb){devinfo.once(paths.USB_STORAGE).then(function(response){prepare(response,cb)})},getConfig:getConfig,subscribeInfo:function(cb,$scope){devinfo.subscribe(paths.USB_STORAGE,function(response){prepare(response,cb)},$scope)}}}])}();