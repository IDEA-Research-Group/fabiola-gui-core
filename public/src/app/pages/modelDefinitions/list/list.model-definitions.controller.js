/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('ModelDefinitionsListCtrl', ModelDefinitionsListCtrl);

    /** @ngInject */
    function ModelDefinitionsListCtrl($http, $stateParams) {
        var vm = this;

        vm.modelDefinition = $stateParams.modelDefinition;

        vm.show = function(instance) {
            vm.modelDefinition = instance;
        }

        vm.callServer = function callServer(tableState) {
            vm.isLoading = true;

            var pagination = tableState.pagination;
            var offset = pagination.start || 0;    // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var limit = pagination.number || 10;  // Number of entries showed per page.

            var pages = (offset / limit) + 1;

            $http
                .get('/api/v1/modelDefinitions?limit=' + limit + '&page=' + pages)
                .then(function (response) {
                    var displayed = response.data.docs;
                    var pages = response.data.pages;
                    var limit = response.data.limit;
                    vm.displayed = displayed;
                    vm.pages = pages;
                    vm.limit = limit;

                    tableState.pagination.numberOfPages = pages;

                    vm.isLoading = false;

                }, function (error) {
                    console.log(error);
                });
        };
    }
})();
