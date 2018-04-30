/**
 * @author Álvaro Valencia
 * created on 26.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.datasets', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {

        $stateProvider
            .state('datasets', {
                url: '/datasets',
                templateUrl: 'app/pages/datasets/datasets.html',
                abstract: true,
                title: 'Dataset Importer',
                sidebarMeta: {
                    icon: 'ion-ios-folder',
                    order: 0,
                },
            })
            .state('datasets.list', {
                url: '/list',
                title: 'List Datasets',
                views: {
                    'content': {
                        templateUrl: 'app/pages/datasets/list/list.html',
                        controller: 'ListDatasetsCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    datasetId: function ($stateParams) {
                        return $stateParams.datasetId;
                    }
                },
                params: {
                    datasetId: null
                },
                sidebarMeta: {
                    order: 0,
                },
            })
            .state('datasets.create', {
                url: '/create',
                title: 'Create Dataset',
                views: {
                    'content': {
                        templateUrl: 'app/pages/datasets/edit/edit.html',
                        controller: 'EditDatasetCtrl',
                        controllerAs: 'vm'
                    }
                },
                sidebarMeta: {
                    order: 10
                }
            })
            .state('datasets.edit', {
                url: '/edit/{datasetId}',
                title: 'Edit Dataset',
                views: {
                    'content': {
                        templateUrl: 'app/pages/datasets/edit/edit.html',
                        controller: 'EditDatasetCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    }

})();
