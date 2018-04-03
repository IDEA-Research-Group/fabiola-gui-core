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
            });
    }

})();
