"use strict";!function(){function SvgIconDirective(){var _template=oldBrowser?'<svg class="icon"><use ng-href="{{\'/general/img/svg/sprite.symbol.svg#\' + svgIcon}}" xlink:href="{{\'/general/img/svg/sprite.symbol.svg#\' + svgIcon}}"></use></svg>':'<svg class="icon"><use ng-href="{{\'/general/img/svg/sprite.symbol.svg#\' + svgIcon}}" xlink:href=""></use></svg>';return{restrict:"A",replace:!0,scope:{svgIcon:"@"},template:function(elem,attr){return attr.svgIcon&&/^[a-zA-Z]/.test(attr.svgIcon)?oldBrowser?'<svg class="icon"><use ng-href="/general/img/svg/sprite.symbol.svg#'+attr.svgIcon+'" xlink:href="{{\'/general/img/svg/sprite.symbol.svg#\' + svgIcon}}"></use></svg>':'<svg class="icon"><use ng-href="/general/img/svg/sprite.symbol.svg#'+attr.svgIcon+'" xlink:href=""></use></svg>':_template}}}var match,begin,end,major,oldBrowser=!1,matches=navigator.userAgent.match(/Chrome\/\d+\.[\d.\s]*Mobile/g);matches&&matches.length>0&&(match=matches[0],begin=match.indexOf("/")+1,end=match.indexOf("."),major=Number.parseInt(match.substring(begin,end)),oldBrowser=48>=major);var svgIconModule=angular.module(regdep("svgIcon"),[]);svgIconModule.directive("svgIcon",[SvgIconDirective])}();