/**
 * @author Álvaro Valencia
 * created on 28.03.2018
 */

(function() {
    'use strict';
    angular
        .module('BlurAdmin.services')
        .factory('Instances', Instances);

    /** @ngInject */
    function Instances($resource) {
        var resourceUrl = '/api/v1/instances/:id';

        return $resource(resourceUrl, {}, {
            'create': {method: 'POST'},
            'get': {method: 'GET'},
            'update': {method: 'PUT'}
        });
    };
})();