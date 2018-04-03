/**
 * @author Álvaro Valencia
 * created on 26.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.modelDefinitions')
        .controller('EditModelDefinitionCtrl', EditModelDefinitionCtrl);

    /** @ngInject */
    function EditModelDefinitionCtrl($http, $q, $state, $stateParams, toastr, ModelDefinitions) {
        var vm = this;

        // This function contains the form logic
        var form = function (modelDefinition, action) {
            vm.modelDefinition = modelDefinition;

            // Ace editor options
            vm.editorOpts = {
                useWrapMode: true,
                showGutter: true,
                theme: 'dawn',
                mode: 'scala',
                firstLineNumber: 1,
                rendererOptions: {fontSize: 16}
            };

            // submit function
            vm.progressFunction = function () {
                if(!vm.modelDefinition.domainData) vm.modelDefinition.domainData = " ";
                if(!vm.modelDefinition.variables) vm.modelDefinition.variables = " ";
                if(!vm.modelDefinition.constraints) vm.modelDefinition.constraints = " ";
                if(!vm.modelDefinition.objective) vm.modelDefinition.objective = " ";
                if(!vm.modelDefinition.solution) vm.modelDefinition.solution = " ";

                // Resolve function
                return $q(function (resolve, reject) {
                    function onSuccess(success) {
                        resolve();
                        var createdOrEdited = (action === 'edit') ? 'edited' : 'created';
                        // toast showing the results
                        toastr.success('The Model Definition has been successfully ' + createdOrEdited + '.', 'Success!', {
                            "positionClass": "toast-top-right",
                            "type": "success",
                            "timeOut": "5000"
                        });
                        $state.go('modelDefinitions.list', {modelDefinition: success});
                    }

                    function onError(error) {
                        reject();
                    }

                    if (action === 'edit') {
                        ModelDefinitions.update({id: vm.modelDefinition._id}, vm.modelDefinition).$promise.then(onSuccess, onError);
                    } else {
                        if(action === 'clone') delete vm.modelDefinition._id;
                        ModelDefinitions.create(vm.modelDefinition).$promise.then(onSuccess, onError);
                    }
                });
            };
        };

        // When entering to the controller, these statement are first executed
        var currentState = $state.$current.self.name;
        var action = (currentState === 'modelDefinitions.clone') ? 'clone' : ((currentState === 'modelDefinitions.edit') ? 'edit' : 'create');

        if (currentState === 'modelDefinitions.edit' || currentState === 'modelDefinitions.clone') {
            ModelDefinitions.get({id: $stateParams.modelDefinitionId}).$promise.then(function (modelDefinition) {
                form(modelDefinition, action);
            });
        } else {
            form({}, action);
        }
        ;
    };
})();