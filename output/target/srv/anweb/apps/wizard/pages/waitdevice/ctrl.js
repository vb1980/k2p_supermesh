"use strict";!function(){angular.module("wizard").controller("wizardWaitDeviceCtrl",["$scope","$stateParams","devinfo","$timeout",function($scope,$stateParams,devinfo,$timeout){function onCondition(){"exit"==action&&(devinfo.suspend(),devinfo.skipAuth.suspend(),$rootScope.showOverlay(!0),$rootScope.exitFromWizard(!1,!0))}function onData(data){console.log("onData",data),"dcc_finished"==condition&&data&&"dcc_finished"==data.dccStatus&&$timeout(onCondition,3e3)}var condition=$stateParams.condition,action=$stateParams.action,timeout=$stateParams.timeout;$scope.checkFinish=function(){$scope.step="error",devinfo.unsubscribe("notice",onData)},$scope.startCheck=function(){$scope.step="check",devinfo.subscribe("notice",onData)},$timeout(function(){devinfo.unsubscribe("notice",onData),$rootScope.showOverlay(!1),$scope.step="error"},timeout),$rootScope.showAvailOverlay(!1),devinfo.subscribe("notice",onData)}])}();