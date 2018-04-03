/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.modelDefinitions', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {

        $stateProvider
            .state('modelDefinitions', {
                url: '/modelDefinitions',
                templateUrl: 'app/pages/modelDefinitions/modelDefinitions.html',
                abstract: true,
                title: 'Model Definitions',
                sidebarMeta: {
                    icon: 'ion-ios-paper',
                    order: 10,
                },
            })
            .state('modelDefinitions.list', {
                url: '/list',
                title: 'List Model Definitions',
                views: {
                    'list': {
                        templateUrl: 'app/pages/modelDefinitions/list/list.html',
                        controller: 'ModelDefinitionsListCtrl',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    modelDefinition: function ($stateParams) {
                        return $stateParams.modelDefinition;
                    }
                },
                params: {
                    modelDefinition: undefined
                },
                sidebarMeta: {
                    order: 0,
                },
            })
            .state('modelDefinitions.create', {
                url: '/create',
                title: 'New Model Definition',
                views: {
                    'create': {
                        templateUrl: 'app/pages/modelDefinitions/edit/edit.html',
                        controller: 'EditModelDefinitionCtrl',
                        controllerAs: 'vm'
                    }
                },
                sidebarMeta: {
                    order: 100,
                }
            }).state('modelDefinitions.edit', {
            url: '/edit/{modelDefinitionId}',
            title: 'Edit Model Definition',
            views: {
                'edit': {
                    templateUrl: 'app/pages/modelDefinitions/edit/edit.html',
                    controller: 'EditModelDefinitionCtrl',
                    controllerAs: 'vm'
                }
            }
        }).state('modelDefinitions.list.delete', {
            url: '/delete/{modelDefinitionId}',
            onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/pages/modelDefinitions/delete/delete.html',
                    controller: 'DeleteModelDefinitionCtrl',
                    controllerAs: 'vm',
                    resolve: {
                        modelDefinitionId: function () {
                            return $stateParams.modelDefinitionId;
                        }
                    }
                }).result.then(function () {
                    $state.go('modelDefinitions.list', null, {reload: 'modelDefinitions.list'});
                }, function () {
                    $state.go('modelDefinitions.list');
                });
            }]
        });
    }

})();
