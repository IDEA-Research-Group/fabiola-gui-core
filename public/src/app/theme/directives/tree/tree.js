/**
 * @author Álvaro Valencia
 * created on 02.05.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.theme')
        .directive('tree', TreeDirective);

    /** @ngInject */
    function TreeDirective($http, Datasets, $state, toastr, $interval, $q) {
        return {
            restrict: 'E',
            scope: {
                nodes: '='
            },
            templateUrl: 'app/theme/directives/tree/tree.html',
            link: function (scope, elem, attr) {

                scope.remove = function (scope) {
                    scope.remove();
                };

                scope.toggle = function (scope) {
                    scope.toggle();
                };

                scope.newSubItem = function (scope) {
                    var nodeData = scope.$modelValue;
                    nodeData.nodes.push({
                        id: nodeData.id * 10 + nodeData.nodes.length,
                        title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                        nodes: []
                    });
                };
            }
        }
    }
})();
