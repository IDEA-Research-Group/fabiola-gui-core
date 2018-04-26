/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.copModels')
        .directive('showCopModel', ShowCopModelDirective);

    /** @ngInject */
    function ShowCopModelDirective(COPModels) {
        return {
            restrict: 'E',
            scope: {
                copModelId: '='
            },
            templateUrl: 'app/pages/copModels/directives/show/show.html',
            link: function(scope, elem, attr) {
                scope.$watch('copModelId', function (newValue, attrs) {
                    if (newValue) {
                        scope.copModel = COPModels.get({'id': newValue});
                    }
                }, true);
                var copModelId = scope.copModelId;
                scope.copModel = COPModels.get({id: copModelId});
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
