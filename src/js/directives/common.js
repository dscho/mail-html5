define(function(require) {
    'use strict';

    var angular = require('angular');

    var ngModule = angular.module('woDirectives', []);

    ngModule.directive('woTouch', function($parse) {
        var className = 'wo-touch-active';

        return function(scope, elm, attrs) {
            var handler = $parse(attrs.woTouch);

            elm.on('touchstart', function() {
                elm.addClass(className);
            });
            elm.on('touchleave touchcancel touchmove touchend', function() {
                elm.removeClass(className);
            });

            elm.on('click', function(event) {
                elm.removeClass(className);
                scope.$apply(function() {
                    handler(scope, {
                        $event: event
                    });
                });
            });
        };
    });

    ngModule.directive('woTooltip', function($document, $timeout) {
        return function(scope, elm, attrs) {
            var selector = attrs.woTooltip;
            var tooltip = $document.find(selector);

            elm.on('mouseover', function() {
                // Compute tooltip position
                var offsetElm = elm.offset();
                var offsetTooltipParent = tooltip.offsetParent().offset();

                // Set tooltip position
                tooltip[0].style.top = (offsetElm.top - offsetTooltipParent.top +
                    elm[0].offsetHeight / 2 - tooltip[0].offsetHeight / 2) + 'px';
                tooltip[0].style.left = (offsetElm.left - offsetTooltipParent.left +
                    elm[0].offsetWidth) + 'px';

                // Wait till browser repaint
                $timeout(function() {
                    tooltip.addClass('tooltip--show');
                });

                /*var top = elm[0].offsetTop;
                var left = elm[0].offsetLeft;
                var width = elm[0].offsetWidth;
                var height = elm[0].offsetHeight;

                tooltip[0].style.transition = 'opacity 0.3s linear';
                tooltip[0].style.top = (top + height / 2 - tooltip[0].offsetHeight / 2) + 'px';
                tooltip[0].style.left = (left + width) + 'px';
                tooltip[0].style.opacity = '1';*/
            });

            elm.on('mouseout', function() {
                tooltip.removeClass('tooltip--show');
                tooltip[0].style.top = '-9999px';
                tooltip[0].style.left = '-9999px';
                /*tooltip[0].style.transition = 'opacity 0.3s linear, top 0.3s step-end, left 0.3s step-end';
                tooltip[0].style.opacity = '0';
                tooltip[0].style.top = '-9999px';
                tooltip[0].style.left = '-9999px';*/
            });
        };
    });

    return ngModule;
});