/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.modelDefinitions')
        .directive('showModelDefinition', ShowModelDefinitionDirective);

    /** @ngInject */
    function ShowModelDefinitionDirective() {
        return {
            restrict: 'E',
            scope: {
                modelDefinition: '='
            },
            templateUrl: 'app/pages/modelDefinitions/directives/show/show.html',
            link: function(scope, elem, attr) {
                // Ace editor options
                scope.editorOpts = {
                    useWrapMode: true,
                    showGutter: true,
                    theme: 'dawn',
                    mode: 'scala',
                    firstLineNumber: 1,
                    rendererOptions: {fontSize: 16}
                };
            }
        }
    }
})();
