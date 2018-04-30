/**
 * @author Álvaro Valencia
 * created on 26.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.datasets')
        .directive('showDataset', ShowDatasetsDirective);

    /** @ngInject */
    function ShowDatasetsDirective($http, Datasets, $state, toastr, $interval, $q) {
        return {
            restrict: 'E',
            scope: {
                datasetId: '='
            },
            templateUrl: 'app/pages/datasets/directives/show/show.html',
            link: function (scope, elem, attr) {

                scope.$watch('datasetId', function (newValue, attrs) {
                    if (newValue) {
                        scope.dataset = Datasets.get({'id': newValue});
                    }
                }, true);

                scope.validateDataset = function (dataset) {
                    var id = dataset._id;
                    $http
                        .post('/api/v1/datasets/validate/' + id, {})
                        .then(function (data) {
                            toastr.success('The dataset is being validated.', 'Success!', {
                                "positionClass": "toast-top-right",
                                "type": "success",
                                "timeOut": "5000"
                            });
                            scope.dataset = Datasets.get({'id': id});
                        }, function (error) {
                        });
                }

                var intervalPromise = $interval(function () {
                    if (scope.dataset) {
                        var id = scope.dataset._id;
                        if (['RUNNING', 'WAITING'].includes(scope.dataset.status)) {
                            $http
                                .get('/api/v1/datasets/' + id)
                                .then(function (response) {
                                    var dataset = response.data;
                                    scope.dataset= dataset;
                                }, function (error) {
                                });
                        }
                    }
                }, 5000);

                elem.on('$destroy', function () {
                    $interval.cancel(intervalPromise);
                });
            }
        }
    }
})();
