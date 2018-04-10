/**
 * @author Álvaro Valencia
 * created on 05.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .directive('filterResults', FilterResultsDirective);

    /** @ngInject */
    function FilterResultsDirective($timeout, searchEngine) {
        return {
            restrict: 'E',
            scope: {
                instanceId: '@',
                field: '@',
                placeholder: '@'
            },
            templateUrl: 'app/pages/instances/directives/filterResults/filterResults.html',
            link: function (scope, elem, attr) {
                scope.inputStr = "";

                scope.delay = (function() {
                    var promise = null;
                    return function(callback, ms) {
                        $timeout.cancel(promise);
                        promise = $timeout(callback, ms);
                    };
                })();

                scope.onChange = function () {
                    searchEngine.updateSearchConfig(scope.instanceId, 'filter', scope.field, scope.inputStr);
                };

                elem.on('$destroy', function () {
                    searchEngine.removeSearchConfig(scope.instanceId, 'filter', scope.field);
                });
            }
        }
    }
})();
