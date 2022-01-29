"use strict";!function(){angular.module("app").service("vserversUtil",["cpe","devinfo","device","funcs",function(cpe,devinfo,device,funcs){function getConfig(){return angular.copy(nativeConfig)}function removeRules(items){var newConfig=funcs.deepClone(__initDsysinitConfig);_.each(items,function(item){_.each(item.ids,function(id){funcs.cutBranch(newConfig,firewallPath+"Rules."+id.__id),_.isUndefined(id.__idLoopDNAT)||funcs.cutBranch(newConfig,firewallPath+"Rules."+id.__idLoopDNAT),_.isUndefined(id.__idLoopSNAT)||funcs.cutBranch(newConfig,firewallPath+"Rules."+id.__idLoopSNAT)})});var diff=funcs.newConfig.makeDiff(__initDsysinitConfig,newConfig,dsysinitAttrs);return cpe.ApplyDifference(diff)}function applyRule(rule,id){function setRule(rules,rule,id){var index=_.findIndex(rules,function(e){return e.__id==id}),ruleArr=prepareRule(rule,id);_.each(ruleArr,function(elem,key){0==key?rules[index]=elem:rules.push(elem)})}function prepareRule(rule){"list"==rule.Dest.Ports[1].PortType&&"ftp"!=rule.Type&&(rule.Dest.Ports[1].End=""),"list"==rule.Source.Ports[1].PortType&&"ftp"!=rule.Type&&(rule.Source.Ports[1].End="");var ports,sports,destPortStart=rule.Dest.Ports[1].Start;destPortStart=destPortStart.replace(/\s+/g,""),destPortStart=destPortStart.split(",");var sourcePortStart=rule.Source.Ports[1].Start;return sourcePortStart=sourcePortStart.replace(/\s+/g,""),sourcePortStart=sourcePortStart.split(","),1==destPortStart.length?(ports=destPortStart[0].split(":"),sports=sourcePortStart[0].split(":"),rule.Dest.Ports[1].Start=ports[0],rule.Dest.Ports[1].End=ports[1]?ports[1]:rule.Dest.Ports[1].End,rule.Source.Ports[1].Start=sports[0],rule.Source.Ports[1].End=sports[1]?sports[1]:rule.Source.Ports[1].End,delete rule.ids,[rule]):_.map(destPortStart,function(elem,key){var id,currentRule=funcs.deepClone(rule),dports=elem.split(":"),sports=sourcePortStart[key].split(":");return currentRule.Dest.Ports[1].Start=dports[0],currentRule.Dest.Ports[1].End=dports[1]?dports[1]:"",currentRule.Source.Ports[1].Start=sports[0],currentRule.Source.Ports[1].End=sports[1]?sports[1]:"",_.has(currentRule,"ids")&&(id=currentRule.ids[key],id?(currentRule.__id=id.__id,currentRule.__idLoopDNAT=id.__idLoopDNAT,currentRule.__idLoopSNAT=id.__idLoopSNAT,currentRule.__obj&&currentRule.__obj[currentRule.__id]&&(currentRule.__protoObj=currentRule.__obj[currentRule.__id].__protoObj,currentRule.__addrObj=currentRule.__obj[currentRule.__id].__addrObj)):0!=key&&_.has(currentRule,"__id")&&delete currentRule.__id,delete currentRule.ids),currentRule})}_.each(__initNativeConfig.Rules,function(rule){setRule(__initNativeConfig.Rules,rule,rule.__id)});var newNativeConfig=funcs.deepClone(__initNativeConfig);_.isUndefined(id)?function(rules,rule){var ruleIndex=function(rules){if(0==rules.length||!rules[0].ids)return rules.length;var result=0;return _.each(rules,function(rule){result+=_.size(rule.ids)}),result}(rules),ruleArr=prepareRule(rule,ruleIndex);_.each(ruleArr,function(elem){rules.push(elem)})}(newNativeConfig.Rules,rule):setRule(newNativeConfig.Rules,rule,id);var convertRules=converter.nativeToDsysinit({Rules:newNativeConfig.Rules}),convertInitRules=converter.nativeToDsysinit({Rules:__initNativeConfig.Rules}),diff=funcs.newConfig.makeDiff(convertInitRules,convertRules,dsysinitAttrs);return cpe.ApplyDifference(diff)}var nativeConfig=null,dsysinitConfig=null,__initNativeConfig=null,__initDsysinitConfig=null,dsysinitAttrs=null,firewallPath="Device.Firewall.IPv4.",Helper=device.vservers.Helper,converter=device.vservers.converter,snatFlag=autoconf.BR2_PACKAGE_ANWEB_NAT_LOOPBACK;return{getConfig:getConfig,pull:function(){function success(response){return dsysinitConfig=funcs.buildTree(response[0].result.ParameterList),dsysinitAttrs=funcs.buildTreeAttributes(response[1].result.ParameterList),nativeConfig=converter.dsysinitToNative({config:dsysinitConfig,snatFlag:snatFlag}),__initDsysinitConfig=funcs.deepClone(dsysinitConfig),__initNativeConfig=funcs.deepClone(nativeConfig),Promise.resolve()}var paths=["Device.Network.",firewallPath,"Device.Services.","Device.Switch."];return paths.push("Device.USB.Modem.","Device.USB.Connection."),Promise.all([cpe.GetParameterValues(paths),cpe.GetParameterAttributes([firewallPath])]).then(success)},removeRules:removeRules,applyRule:applyRule,makeHelper:function(){return new Helper},getDefaultRule:function(){var defRule={Enable:!0,Proto:"TCP",Type:"custom",Name:"",Source:{Iface:"all",IP:[""],Ports:{1:{Start:"",End:"",PortType:"list"}}},Dest:{IP:[""],Ports:{1:{Start:"",End:"",PortType:"list"}}}};return defRule.SNAT=void 0,defRule}}}])}();