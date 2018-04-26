/**
 * @author Álvaro Valencia
 * created on 02.04.2018
 */

(function() {
    'use strict';
    angular
        .module('BlurAdmin.services')
        .factory('COPModels', COPModels);

    /** @ngInject */
    function COPModels($resource) {
        var resourceUrl = '/api/v1/copModels/:id';

        return $resource(resourceUrl, {}, {
            'create': {method: 'POST'},
            'get': {method: 'GET'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });
    };
})();