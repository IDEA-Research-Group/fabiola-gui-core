/**
 * @author Álvaro Valencia
 * created on 26.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.datasets')
        .directive('showEditDataset', ShowEditDatasetsDirective);

    /** @ngInject */
    function ShowEditDatasetsDirective($http, Datasets, $state, toastr, $interval, $q) {
        return {
            restrict: 'E',
            scope: {
                datasetId: '='
            },
            templateUrl: 'app/pages/datasets/directives/showEdit/showEdit.html',
            link: function (scope, elem, attr) {
                scope.edit = false;

                // Options
                scope.dataSourceOptions = [{label: 'MongoDB', value: 'mongo'}, {label: 'HDFS', value: 'hdfs'}];
                scope.formatOptions = [{label: 'JSON', value: 'json'}, {label: 'CSV', value: 'csv'}];

                scope.switchEdit = function () {
                    scope.edit = !scope.edit;
                };

                scope.update = function (dataset) {
                    return $q(function (resolve, reject) {
                        function onSuccess(success) {
                            resolve();
                            //var createdOrEdited = (action === 'edit') ? 'edited' : 'created';
                            // toast showing the results
                            // toastr.success('The Dataset has been successfully ' + createdOrEdited + '.', 'Success!', {
                            toastr.success('The Dataset has been successfully edited.', 'Success!', {
                                "positionClass": "toast-top-right",
                                "type": "success",
                                "timeOut": "5000"
                            });
                            // $state.go('datasets.list', {dataset: success});
                            scope.edit = false;
                            scope.dataset = success;
                        }

                        function onError(error) {
                            reject();
                        }

                        Datasets.update({id: dataset._id}, dataset).$promise.then(onSuccess, onError);
                    });
                };

                scope.$watch('datasetId', function (newValue, attrs) {
                    if (newValue) {
                        scope.edit = false;
                        scope.dataset = Datasets.get({'id': newValue});
                    }
                }, true);

                // scope.runInstance = function (instance) {
                //     var id = instance._id;
                //     $http
                //         .post('/api/v1/instances/run/' + id, {})
                //         .then(function (data) {
                //             toastr.success('The instance now is running.', 'Success!', {
                //                 "positionClass": "toast-top-right",
                //                 "type": "success",
                //                 "timeOut": "5000"
                //             });
                //             scope.instance = Instances.get({'id': id});
                //         }, function (error) {
                //         });
                // }

                // var intervalPromise = $interval(function () {
                //     if (scope.instance) {
                //         var id = scope.instance._id;
                //         if (scope.instance.status === 'RUNNING') {
                //             $http
                //                 .get('/api/v1/instances/status/' + id)
                //                 .then(function (response) {
                //                     scope.instance = response.data;
                //                 }, function (error) {
                //                 });
                //         }
                //     }
                // }, 10000);
                //
                // elem.on('$destroy', function () {
                //     $interval.cancel(intervalPromise);
                // });
            }
        }
    }
})();
