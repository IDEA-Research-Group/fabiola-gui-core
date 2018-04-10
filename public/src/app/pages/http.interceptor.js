/**
 * @author Álvaro Valencia
 * created on 02.04.2018
 */


(function() {
    'use strict';
    angular
        .module('BlurAdmin.pages.instances')
        .factory('httpRequestInterceptor', HttpRequestInterceptor);

    /** @ngInject */
    function HttpRequestInterceptor($q, $injector) {
        return {
            'responseError': function(rejection) {
                var errorHandlerService = $injector.get('errorHandler');
                //var deferred = $q.defer();

                // Evaluate the error message
                errorHandlerService.evaluate(rejection);

                //deferred.resolve(response);
                //return deferred.promise;
                return $q.reject(rejection);
            }
        };
    }
})();