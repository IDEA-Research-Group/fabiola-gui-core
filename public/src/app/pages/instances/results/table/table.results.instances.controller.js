/**
 * @author Álvaro Valencia
 * created on 04.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('ResultsTableCtrl', ResultsTableCtrl);

    /** @ngInject */
    function ResultsTableCtrl(Instances, $stateParams, $http) {
        var vm = this;

        var instanceId = $stateParams.instanceId;
        var instance = Instances.get({'id': instanceId});

        vm.instanceId = instanceId;
        vm.instance = instance;

        vm.inFields = [];
        vm.outFields = [];
        vm.otFields = [];


        vm.updateInList = function(field) {
            if(!vm.inFields.includes(field)){
                vm.inFields.push(field);
            } else {
                var index = vm.inFields.indexOf(field);
                if(index!== -1) vm.inFields.splice(index, 1);
            }
        }

        vm.updateOutList = function(field) {
            if(!vm.outFields.includes(field)){
                vm.outFields.push(field);
            } else {
                var index = vm.outFields.indexOf(field);
                if(index!== -1) vm.outFields.splice(index, 1);
            }
        }

        vm.updateOtList = function(field) {
            if(!vm.otFields.includes(field)){
                vm.otFields.push(field);
            } else {
                var index = vm.otFields.indexOf(field);
                if(index!== -1) vm.otFields.splice(index, 1);
            }
        }

        vm.callServer = function callServer(tableState) {

            vm.isLoading = true;

            var pagination = tableState.pagination;
            var offset = pagination.start || 0;    // This is NOT the page number, but the index of item in the list that you want to use to display the table.
            var limit = pagination.number || 10;  // Number of entries showed per page.

            var pages = (offset / limit) + 1;

            $http
                .get('/api/v1/results/'+instanceId+'?limit=' + limit + '&page=' + pages)
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
                });
        };

    }
})();
