/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .directive('showInstance', ShowInstanceDirective);

    /** @ngInject */
    function ShowInstanceDirective() {
        return {
            restrict: 'E',
            scope: {
                instance: '='
            },
            templateUrl: 'app/pages/instances/directives/show/show.html',
            link: function(scope, elem, attr) {
            }
        }
    }
})();
