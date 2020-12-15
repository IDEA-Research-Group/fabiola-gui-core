/**
 * @author Álvaro Valencia
 * created on 04.074.2018
 */

(function () {
    'use strict';

    angular.module('BlurAdmin.validators')
        .directive('listNotEmpty', listNotEmpty);

    /** @ngInject */
    function listNotEmpty() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$validators.integer = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        // consider empty models to be invalid
                        return false;
                    }
                    console.log(viewValue)
                    if (viewValue[0]) {
                        // it is valid
                        return true;
                    }

                    // it is invalid
                    return false;
                };
            }
        };
    }

})();