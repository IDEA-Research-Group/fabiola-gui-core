/**
 * @author Álvaro Valencia
 * created on 03.04.2016
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.modelDefinitions')
        .controller('DeleteModelDefinitionCtrl', DeleteModelDefinitionCtrl);

    /** @ngInject */
    function DeleteModelDefinitionCtrl(ModelDefinitions, $stateParams, $uibModalInstance, toastr) {
        var vm = this;

        var modelDefinitionId = $stateParams.modelDefinitionId;
        var modelDefinition = ModelDefinitions.get({id: modelDefinitionId});

        vm.modelDefinition = modelDefinition;

        vm.delete = function () {
            console.log(modelDefinition)
            ModelDefinitions.delete({id: modelDefinition._id}).$promise.then(function(success){
                toastr.success('The Model Definition has been successfully deleted', 'Success!', {
                    "positionClass": "toast-top-right",
                    "type": "success",
                    "timeOut": "5000"
                });
                $uibModalInstance.close();
            }, function(error){
                $uibModalInstance.dismiss('cancel');
            });
        };
    }
})();