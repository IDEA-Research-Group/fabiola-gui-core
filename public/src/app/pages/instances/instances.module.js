/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider, $httpProvider) {

        $stateProvider
            .state('instances', {
                url: '/instances',
                templateUrl: 'app/pages/instances/instances.html',
                abstract: true,
                title: 'Instances',
                sidebarMeta: {
                    icon: 'ion-ios-bolt',
                    order: 0,
                },
            })
            .state('instances.list', {
                url: '/list',
                title: 'List instances',
                views: {
                    'list': {
                        templateUrl: 'app/pages/instances/list/list.html',
                        controller: 'InstancesListCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    instance: function ($stateParams) {
                        return $stateParams.instance;
                    }
                },
                params: {
                    instance: undefined
                },
                sidebarMeta: {
                    order: 0,
                },
            })
            .state('instances.create', {
                url: '/create',
                title: 'Create instance',
                views: {
                    'create': {
                        templateUrl: 'app/pages/instances/edit/edit.html',
                        controller: 'EditInstanceCtrl',
                        controllerAs: 'vm'
                    }
                },
                sidebarMeta: {
                    order: 100,
                }
            })
            .state('instances.edit', {
                url: '/edit/{instanceId}',
                title: 'Edit instance',
                views: {
                    'edit': {
                        templateUrl: 'app/pages/instances/edit/edit.html',
                        controller: 'EditInstanceCtrl',
                        controllerAs: 'vm'
                    }
                }
            });

    }

})();
