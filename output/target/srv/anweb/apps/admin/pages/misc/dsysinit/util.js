"use strict";!function(){angular.module("app").service("miscUtil",["cpe","funcs","device",function(cpe,funcs,device){function apply(settings){var data=converter.nativeToDsysinit(settings),initData=funcs.deepClone(__initData);_.has(initData.passThrough,"pptpId")||delete initData.passThrough.pptp,_.has(initData.passThrough,"l2tpId")||delete initData.passThrough.l2tp,_.has(initData.passThrough,"ipsecId")||delete initData.passThrough.ipsec;var __initConfig=converter.nativeToDsysinit(initData),diff=funcs.newConfig.makeDiff(__initConfig,data,attrs);return cpe.ApplyDifference(diff)}function getConfig(){return config?config:""}var config=null,attrs=null,__initData=null,converter=device.misc.converter,constants={rules:"Device.Firewall.IPv4.Rules.",settings:"Device.Network.Settings."};return{pull:function(){function success(response){var data=funcs.buildTree(response[0].result.ParameterList);return attrs=funcs.buildTreeAttributes(response[1].result.ParameterList),config=converter.dsysinitToNative(data),__initData=funcs.deepClone(config),Promise.resolve()}return Promise.all([cpe.GetParameterValues([constants.rules,constants.settings]),cpe.GetParameterAttributes([constants.rules,constants.settings])]).then(success,function(){return Promise.reject()})},apply:apply,getConfig:getConfig}}])}();