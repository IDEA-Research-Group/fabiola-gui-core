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
                datasetId: '=',
            },
            templateUrl: 'app/pages/datasets/directives/show/show.html',
            link: function (scope, elem, attr) {
                // Check attributes
                // no-buttons
                if(attr.hasOwnProperty('noButtons')) {
                    scope.hideButtons = true;
                }

                // no-panel
                if(attr.hasOwnProperty('noPanel')) {
                    scope.hidePanel = true;
                }

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
                    scope.treeConfig = {
                        'core': {
                            'check_callback': false,
                            'themes': {
                                'responsive': false
                            },
                        },
                        'types': {
                            'folder': {
                                'icon': 'ion-ios-folder'
                            },
                            'default': {
                                'icon': 'ion-document-text'
                            }
                        },
                        "plugins": ["dnd", 'types', 'crrm', 'unique'],
                        "version": 1
                    };

                    var dataset = scope.dataset;

                    var schemaObj = JSON.parse(dataset.dsSchema);
                    var transformedTree = transformTree(schemaObj.fields, '#', 0);

                    console.log(transformedTree)

                    scope.dsSchema = transformedTree

                    // scope.dsSchema = [
                    //     {
                    //         title: 'root',
                    //         nodes: transformedTree
                    //     }
                    // ];
                    //
                    // scope.input = [{
                    //     'id': 1,
                    //     'title': 'IN',
                    //     'nodes': []
                    // }];
                    // scope.output = [{
                    //     'id': 1,
                    //     'title': 'OUT',
                    //     'nodes': []
                    // }];
                    // scope.other = [{
                    //     'id': 1,
                    //     'title': 'OT',
                    //     'nodes': []
                    // }];
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

    function transformTree(nodes, parent, parentId) {
        var treeNodes = [];
        var idCount = 0;
        nodes.forEach(n => {
            treeNodes.push({
                id: parentId === 0 ? String(idCount) : parentId + '.' + idCount,
                parent: parentId === 0 ? '#' : parentId,
                text: n.name,
                state: {opened: true},
                type: (['struct', 'array'].includes(getNodeType(n.type))? 'folder' : undefined)
            });

            var childNodes = [];
            if(getNodeType(n.type) === 'struct')
                childNodes = transformTree(n.type.fields, n.name, parentId === 0 ? idCount : parentId + '.' + idCount);
            else if(getNodeType(n.type) === 'array')
                childNodes = transformTree(n.type.elementType.fields, n.name, parentId === 0 ? idCount : parentId + '.' + idCount);


            idCount ++;

            treeNodes = treeNodes.concat(childNodes);
            }
        );
        return treeNodes;
    }

    function getNodeType(type) {
        return typeof type === 'object' ? type.type : type;
    }

})();
