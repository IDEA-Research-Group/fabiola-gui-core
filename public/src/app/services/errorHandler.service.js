/**
 * @author Álvaro Valencia
 * created on 28.03.2018
 */

(function () {
    'use strict';
    angular
        .module('BlurAdmin.services')
        .service('errorHandler', ErrorHandler);

    /** @ngInject */
    function ErrorHandler($injector, $state) {
        this.evaluate = function (error/*, toState, params = {}*/) {
            // Inject the toastr module
            var toastr = $injector.get('toastr');

            var message = "An unexpected error has occurred. Please try again later.";

            var serverErrorMsg = error.data.error ? error.data.error : "";

            // If error is due to unprocessable entity then show the validation errors
            if (error.status === 422) {
                message = "There are errors on your form: \n";
            } else if (error.status === 400) {
                message = "Bad request. \n";
            } else if (error.status === 404) {
                message = "Not found. \n";
            }

            message += serverErrorMsg;

            // Show the error notification
            toastr.error(message, 'Error', {
                "positionClass": "toast-top-right",
                "type": "error",
                "timeOut": "10000"
            });

            // If the error message is not 422 or 400, redirect to the list state
            if (![422, 400].includes(error.status)) {
                var currentStateName = $state.$current.self.name;
                var parentStateName = $state.$current.parent.self.name;

                // If the parent state is included in the list, redirect to the 'list' state. Otherwise, redirect
                // to the dashboard state.
                if (['instances', 'instances.list', 'modelDefinitions', 'modelDefinitions.list'].includes(parentStateName) &&
                    currentStateName != parentStateName + '.list') {
                    var toState = parentStateName.split('.').includes('list') ? parentStateName : parentStateName + '.list';
                    $state.go(toState);
                } else {
                    $state.go('dashboard');
                }
            }
        }
    };
})();