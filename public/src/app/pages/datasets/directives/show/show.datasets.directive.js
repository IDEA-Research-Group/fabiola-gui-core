/**
 * @author Álvaro Valencia
 * created on 26.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.datasets')
        .directive('showDataset', ShowDatasetsDirective);

    /** @ngInject */
    function ShowDatasetsDirective($http, Datasets, $state, toastr, $interval, $uibModal) {
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
                };

                var showSchema = function() {
                    var dataset = scope.dataset;

                    var root = {
                        title: 'root',
                        nodes: []
                    };

                    var schemaObj = JSON.parse(dataset.dsSchema);

                    var transformedTree = transformTree(schemaObj.fields, '');

                    scope.dsSchema = [
                        {
                            title: 'root',
                            nodes: transformedTree
                        }
                    ];

                    scope.input = [{
                        'id': 1,
                        'title': 'IN',
                        'nodes': []
                    }];
                    scope.output = [{
                        'id': 1,
                        'title': 'OUT',
                        'nodes': []
                    }];
                    scope.other = [{
                        'id': 1,
                        'title': 'OT',
                        'nodes': []
                    }];
                };

                scope.open = function (page, size) {
                    showSchema();
                    $uibModal.open({
                        animation: true,
                        templateUrl: page,
                        size: size,
                        scope: scope
                    });
                };

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

    function transformTree(nodes, path) {
        return nodes.map(n => {
            var thisPath = (path === '')? n.name : path+'.'+n.name;
            return {
                    path: thisPath,
                    //title: n.name, // TODO title must be the name, not the path. But it would require
                    title: thisPath,
                    type: getNodeType(n.type),
                    nodes: (getNodeType(n.type) === 'struct')? transformTree(n.type.fields, thisPath) :
                        (getNodeType(n.type) === 'array')? transformTree(n.type.elementType.fields, thisPath) : []
                }
            }
        );
    }

    function getNodeType(type) {
        return typeof type === 'object' ? type.type : type;
    }

})();
