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
        var form = function (modelDefinition, isEdit) {
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
                        var createdOrEdited = isEdit ? 'edited' : 'created';
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

                    if (isEdit) {
                        ModelDefinitions.update({id: vm.modelDefinition._id}, vm.modelDefinition).$promise.then(onSuccess, onError);
                    } else {
                        ModelDefinitions.create(vm.modelDefinition).$promise.then(onSuccess, onError);
                    }

                });
            };
        };

        // When entering to the controller, these statement are first executed
        if ($stateParams.modelDefinitionId) {
            ModelDefinitions.get({id: $stateParams.modelDefinitionId}).$promise.then(function (modelDefinition) {
                form(modelDefinition, true)
            });
        } else {
            form({}, false);
        }
        ;
    };
})();