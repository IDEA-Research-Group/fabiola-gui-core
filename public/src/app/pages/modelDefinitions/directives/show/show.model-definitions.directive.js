/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.modelDefinitions')
        .directive('showModelDefinition', ShowModelDefinitionDirective);

    /** @ngInject */
    function ShowModelDefinitionDirective(ModelDefinitions) {
        return {
            restrict: 'E',
            scope: {
                modelDefinitionId: '='
            },
            templateUrl: 'app/pages/modelDefinitions/directives/show/show.html',
            link: function(scope, elem, attr) {
                scope.$watch('modelDefinitionId', function (newValue, attrs) {
                    if (newValue) {
                        scope.modelDefinition = ModelDefinitions.get({'id': newValue});
                    }
                }, true);
                var modelDefinitionId = scope.modelDefinitionId;
                scope.modelDefinition = ModelDefinitions.get({id: modelDefinitionId});
                // Ace editor options
                /*
                scope.editorOpts = {
                    useWrapMode: true,
                    showGutter: true,
                    theme: 'dawn',
                    mode: 'scala',
                    firstLineNumber: 1,
                    rendererOptions: {fontSize: 16}
                };
                */
            }
        }
    }
})();
