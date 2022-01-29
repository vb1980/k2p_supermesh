"use strict";!function(){angular.module("app").service("ipfilterUtil",["cpe","device","funcs",function(cpe,device,funcs){function wasActivate(){return activate}function removeRules(removeList){var list=function(removeList){var indexes=[];return _.each(removeList,function(item){indexes.push(item.data)}),indexes}(removeList),newConfig=funcs.deepClone(__initData);_.each(list,function(item){var rulePath=constants.rules+(item.is_init_ipv6?"IPv6":"IPv4")+".Rules."+item.__index;funcs.cutBranch(newConfig,rulePath)});var diff=funcs.newConfig.makeDiff(__initData,newConfig,attrs);return cpe.ApplyDifference(diff)}function applyRule(rule){var initType,data=converterIpFilter.nativeToDsysinit(rule),type=rule.is_ipv6?"IPv6":"IPv4",rulePath=constants.rules+type+".Rules",initRule=funcs.fetchBranch(__initData,rulePath+"."+rule.__index+".");initRule=initRule?funcs.setValue(rulePath+"."+rule.__index,initRule,{}):funcs.setValue(rulePath,{},{}),_.has(rule,"is_init_ipv6")&&rule.is_ipv6!=rule.is_init_ipv6&&(initType=rule.is_init_ipv6?"IPv6":"IPv4",funcs.setValue(constants.rules+initType+".Rules."+rule.__index,{},initRule),funcs.setValue(constants.rules+initType+".Rules",{},data));var diff=funcs.newConfig.makeDiff(initRule,data,attrs);return _.isEmpty(diff)?Promise.resolve():cpe.ApplyDifference(diff)}function makeHelper(){return new device.ipfilter.Helper(ipfilter,lan,attributes)}var ipfilter=null,attrs=null,lan=null,attributes=null,activate=!1,__initData=null,converterIpFilter=device.ipfilter.ipfilterConverter,converterLan=device.ipfilter.lanConverter,constants={rules:"Device.Firewall.",network:"Device.Network."};return{pull:function(){function success(response){var data=funcs.buildTree(response[0].result.ParameterList);return attrs=funcs.buildTreeAttributes(response[1].result.ParameterList),__initData=funcs.deepClone(data),ipfilter=converterIpFilter.dsysinitToNative(data),lan=converterLan.cpeToNative.config(data).LAN,attributes=converterIpFilter.attrsToNative(attrs),activate=!0,Promise.resolve()}return Promise.all([cpe.GetParameterValues([constants.rules,constants.network]),cpe.GetParameterAttributes([constants.rules])]).then(success,function(){return Promise.reject()})},wasActivate:wasActivate,removeRules:removeRules,applyRule:applyRule,makeHelper:makeHelper}}])}();