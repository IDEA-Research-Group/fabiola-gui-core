/**
 * @author Álvaro Valencia
 * created on 30.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.datasets')
        .controller('EditDatasetCtrl', EditDatasetCtrl);

    /** @ngInject */
    function EditDatasetCtrl($http, $q, $state, $stateParams, toastr, Datasets) {
        var vm = this;

        // Options
        vm.dataSourceOptions = [{label: 'MongoDB', value: 'mongo'}, {label: 'HDFS', value: 'hdfs'}];
        vm.formatOptions = [{label: 'JSON', value: 'json'}, {label: 'CSV', value: 'csv'}];

        // This function contains the form logic
        var form = function (dataset, action) {
            vm.dataset = dataset;

            // submit function
            vm.progressFunction = function () {
                // Resolve function
                return $q(function (resolve, reject) {
                    function onSuccess(success) {
                        resolve();
                        var createdOrEdited = (action === 'edit') ? 'edited' : 'created';
                        // toast showing the results
                        toastr.success('The Dataset has been successfully ' + createdOrEdited + '.', 'Success!', {
                            "positionClass": "toast-top-right",
                            "type": "success",
                            "timeOut": "5000"
                        });
                        $state.go('datasets.list', {datasetId: success._id});
                    }

                    function onError(error) {
                        reject();
                    }

                    if (action === 'edit') {
                        Datasets.update({id: vm.dataset._id}, vm.dataset).$promise.then(onSuccess, onError);
                    } else {
                        if(vm.dataset.local) {
                            var file = vm.file;
                            var fd = new FormData();
                            fd.append('dataset', file);
                            $http
                                .post('/api/v1/datasets/upload', fd, {transformRequest: angular.identity, headers: {'Content-Type': undefined}})
                                .then(onSuccess, onError);
                        } else {
                            Datasets.create(vm.dataset).$promise.then(onSuccess, onError);
                        }
                    }
                });
            };
        };

        // When entering to the controller, these statement are first executed
        var currentState = $state.$current.self.name;
        var action = (currentState === 'datasets.edit') ? 'edit' : 'create';
        vm.action = action;

        if (['edit', 'clone'].includes(action)) {
            Datasets.get({id: $stateParams.datasetId}).$promise.then(function (dataset) {
                form(dataset, action);
            });
        } else {
            form({local: false}, action);
        };
    };
})();