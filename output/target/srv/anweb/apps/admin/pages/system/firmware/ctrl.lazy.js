"use strict";!function(){angular.module("app").controllerProvider.register("SysFirmwareCtrl",["$scope","$state","sysFirmwareUtil","funcs","translate","overlay-simple","navigationFilter",function($scope,$state,util,funcs,translate,overlaySimple,navigationFilter){function remoteApplySettings(check){if(!$scope.firmwareSettings.$invalid){var overlayId=overlay.start();return util.apply(firmware.config,check).then(function(){firmware.config=util.getConfig(),firmware.status=util.getStatus(),__backup=angular.copy(firmware.config),overlay.stop(overlayId)})}}function wasModified(){function omitKeys(obj){return _.omit(obj,"Server")}function isEqualServer(){return _.isEmpty(__backup.Server)&&_.isEqual(firmware.config.Server,[""])?!0:_.isEqual(__backup.Server,firmware.config.Server)}return __backup&&(!_.isEqual(omitKeys(__backup),omitKeys(firmware.config))||!isEqualServer())}function wasModifiedServer(){return __backup&&!funcs.deepEqual(__backup.Server,firmware.config.Server)}var rules=navigationFilter.rules();$scope.firmware={config:null,status:null,curVersion:"",rules:rules,local:{fwUploadURL:"/fwupload",fwUseFormData:util.useFormData,fwUploadBefore:util.localFwUploadBefore,fwUploadBegin:util.localFwUploadBegin,fwUploadEnd:util.localfwUploadEnd,fwResetAnyway:autoconf.BR2_PACKAGE_ANWEB_CUSTOM_BRAZIL_35835?!0:!1,fwGetUrlParams:function(){return{reset_anyway:firmware.local.fwResetAnyway}}},remote:{applySettings:remoteApplySettings,checkUpdates:function(){return $scope.firmwareSettings.$invalid?void 0:remoteApplySettings(!0)},update:function(){function error(){alert(translate("firmware_remote_update_failed")),location.reload()}confirm(translate("firmware_update_confirm"))&&(overlaySimple.start({event:"fwupdate.remote"}),util.remoteUpdate().then(function(){overlaySimple.stop({event:"fwupdate.remote"})})["catch"](error))},isShowPeriod:function(){var config=firmware.config;return config&&config.Enable&&_.has(config,"Period")},isNeedUpdate:util.isNeedUpdate,placeholder:_.isUndefined(rules.SetFirmwareServerPlaceholder)?"fwupdate.dlink.ru":rules.SetFirmwareServerPlaceholder},wasModified:wasModified,wasModifiedServer:wasModifiedServer};var firmware=$scope.firmware,overlay=$scope.overlay.circular,__backup=null;!function(){util.init().then(function(){firmware.config=util.getConfig(),firmware.status=util.getStatus(),__backup=angular.copy(firmware.config),firmware.curVersion=util.getVersion()})["catch"](function(err){console.log(err),$state.go("error",{code:"msg_pull_error",message:"msg_error_desc"})})["finally"]($scope.$emit.bind($scope,"pageload"))}()}])}();