/**
 * @author Álvaro Valencia
 * created on 03.04.2016
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.copModels')
        .controller('DeleteCOPModelCtrl', DeleteCOPModelCtrl);

    /** @ngInject */
    function DeleteCOPModelCtrl(COPModels, $stateParams, $uibModalInstance, toastr) {
        var vm = this;

        var copModelId = $stateParams.copModelId;
        var copModel = COPModels.get({id: copModelId});

        vm.copModel = copModel;

        vm.delete = function () {
            console.log(copModel)
            COPModels.delete({id: copModel._id}).$promise.then(function(success){
                toastr.success('The COP Model has been successfully deleted', 'Success!', {
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