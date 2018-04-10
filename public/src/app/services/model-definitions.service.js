/**
 * @author Álvaro Valencia
 * created on 02.04.2018
 */

(function() {
    'use strict';
    angular
        .module('BlurAdmin.services')
        .factory('ModelDefinitions', ModelDefinitions);

    /** @ngInject */
    function ModelDefinitions($resource) {
        var resourceUrl = '/api/v1/modelDefinitions/:id';

        return $resource(resourceUrl, {}, {
            'create': {method: 'POST'},
            'get': {method: 'GET'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });
    };
})();