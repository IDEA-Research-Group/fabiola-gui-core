/**
 * @author Álvaro Valencia
 * created on 26.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.copModels')
        .controller('EditCOPModelCtrl', EditCOPModelCtrl);

    /** @ngInject */
    function EditCOPModelCtrl($http, $q, $state, $stateParams, toastr, COPModels) {
        var vm = this;

        // This function contains the form logic
        var form = function (copModel, action) {
            vm.copModel = copModel;

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
                if(!vm.copModel.model) vm.copModel.model = " ";

                // Resolve function
                return $q(function (resolve, reject) {
                    function onSuccess(success) {
                        resolve();
                        var createdOrEdited = (action === 'edit') ? 'edited' : 'created';
                        // toast showing the results
                        toastr.success('The COP Model has been successfully ' + createdOrEdited + '.', 'Success!', {
                            "positionClass": "toast-top-right",
                            "type": "success",
                            "timeOut": "5000"
                        });
                        $state.go('copModels.list', {copModel: success});
                    }

                    function onError(error) {
                        reject();
                    }

                    if (action === 'edit') {
                        COPModels.update({id: vm.copModel._id}, vm.copModel).$promise.then(onSuccess, onError);
                    } else {
                        if(action === 'clone') delete vm.copModel._id;
                        COPModels.create(vm.copModel).$promise.then(onSuccess, onError);
                    }
                });
            };
        };

        // When entering to the controller, these statement are first executed
        var currentState = $state.$current.self.name;
        var action = (currentState === 'copModels.clone') ? 'clone' : ((currentState === 'copModels.edit') ? 'edit' : 'create');

        if (['edit', 'clone'].includes(action)) {
            COPModels.get({id: $stateParams.copModelId}).$promise.then(function (copModel) {
                form(copModel, action);
            });
        } else {
            form({}, action);
        };
    };
})();