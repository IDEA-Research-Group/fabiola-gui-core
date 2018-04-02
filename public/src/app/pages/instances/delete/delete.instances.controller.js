/**
 * @author Álvaro Valencia
 * created on 02.04.2016
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('DeleteInstanceCtrl', DeleteInstanceCtrl);

    /** @ngInject */
    function DeleteInstanceCtrl(Instances, $stateParams, $uibModalInstance, toastr) {
        var vm = this;

        var instanceId = $stateParams.instanceId;
        var instance = Instances.get({id: instanceId});

        vm.instance = instance;

        vm.delete = function () {
            Instances.delete({id: instance._id}).$promise.then(function(success){
                toastr.success('The instance has been successfully deleted', 'Success!', {
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