/**
 * @author Álvaro Valencia
 * created on 26.04.2018
 */

(function() {
    'use strict';
    angular
        .module('BlurAdmin.services')
        .factory('Datasets', Datasets);

    /** @ngInject */
    function Datasets($resource) {
        var resourceUrl = '/api/v1/datasets/:id';

        return $resource(resourceUrl, {}, {
            'create': {method: 'POST'},
            'get': {method: 'GET'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });
    };
})();