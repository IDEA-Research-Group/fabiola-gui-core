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
                title: 'Instances',
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
                        controller: 'ListDatasetsCtrk',
                        controllerAs: 'vm'
                    }
                },
                sidebarMeta: {
                    order: 0,
                },
            });
    }

})();
