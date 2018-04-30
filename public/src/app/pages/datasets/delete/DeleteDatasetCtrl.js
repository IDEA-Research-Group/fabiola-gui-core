/**
 * @author Álvaro Valencia
 * created on 30.04.2016
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.datasets')
        .controller('DeleteDatasetCtrl', DeleteDatasetCtrl);

    /** @ngInject */
    function DeleteDatasetCtrl(Datasets, $stateParams, $uibModalInstance, toastr) {
        var vm = this;

        var datasetId = $stateParams.datasetId;
        var dataset = Datasets.get({id: datasetId});

        vm.dataset = dataset;

        vm.delete = function () {
            Datasets.delete({id: dataset._id}).$promise.then(function(success){
                toastr.success('The dataset has been successfully deleted', 'Success!', {
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