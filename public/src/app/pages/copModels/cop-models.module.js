/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.copModels', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {

        $stateProvider
            .state('copModels', {
                url: '/copModels',
                templateUrl: 'app/pages/copModels/copModels.html',
                abstract: true,
                title: 'COP Models',
                sidebarMeta: {
                    icon: 'ion-ios-paper',
                    order: 10,
                },
            })
            .state('copModels.list', {
                url: '/list',
                title: 'List COP Models',
                views: {
                    'list': {
                        templateUrl: 'app/pages/copModels/list/list.html',
                        controller: 'ListCOPModelsCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    copModelId: function ($stateParams) {
                        return $stateParams.copModelId;
                    }
                },
                params: {
                    copModelId: null
                },
                sidebarMeta: {
                    order: 0,
                },
            })
            .state('copModels.create', {
                url: '/create',
                title: 'New COP Model',
                views: {
                    'edit': {
                        templateUrl: 'app/pages/copModels/edit/edit.html',
                        controller: 'EditCOPModelCtrl',
                        controllerAs: 'vm'
                    }
                },
                sidebarMeta: {
                    order: 100,
                }
            }).state('copModels.edit', {
            url: '/edit/{copModelId}',
            title: 'Edit COP Model',
            views: {
                'edit': {
                    templateUrl: 'app/pages/copModels/edit/edit.html',
                    controller: 'EditCOPModelCtrl',
                    controllerAs: 'vm'
                }
            }
        }).state('copModels.clone', {
            url: '/clone/{copModelId}',
            title: 'Clone COP Model',
            views: {
                'edit': {
                    templateUrl: 'app/pages/copModels/edit/edit.html',
                    controller: 'EditCOPModelCtrl',
                    controllerAs: 'vm'
                }
            }
        }).state('copModels.list.delete', {
            url: '/delete/{copModelId}',
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/pages/copModels/delete/delete.html',
                    controller: 'DeleteCOPModelCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        copModelId: function () {
                            return $stateParams.copModelId;
                        }
                    }
                }).result.then(function () {
                    $state.go('copModels.list', null, {reload: 'copModels.list'});
                }, function () {
                    $state.go('copModels.list');
                });
            }]
        });
    }

})();
