(function () {
    'use strict';

    angular.module('BlurAdmin.theme')
        .directive('fileModel', fileModel);

    /** @ngInject */
    function fileModel($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        console.log(element[0].files[0])
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }

})();