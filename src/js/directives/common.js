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

    return ngModule;
});