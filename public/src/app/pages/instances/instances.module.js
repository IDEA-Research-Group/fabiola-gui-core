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
                title: 'List Instances',
                views: {
                    'list': {
                        templateUrl: 'app/pages/instances/list/list.html',
                        controller: 'ListInstancesCtrl',
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
                title: 'New Instance',
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
                title: 'Edit Instance',
                views: {
                    'edit': {
                        templateUrl: 'app/pages/instances/edit/edit.html',
                        controller: 'EditInstanceCtrl',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('instances.list.delete', {
                url: '/delete/{instanceId}',
                onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                    $uibModal.open({
                        templateUrl: 'app/pages/instances/delete/delete.html',
                        controller: 'DeleteInstanceCtrl',
                        controllerAs: 'vm',
                        resolve: {
                            instanceId: function () {
                                return $stateParams.instanceId
                            }
                        }
                    }).result.then(function () {
                        $state.go('instances.list', null, {reload: 'instances.list'});
                    }, function () {
                        $state.go('instances.list');
                    });
                }]
            })
    }

})();
