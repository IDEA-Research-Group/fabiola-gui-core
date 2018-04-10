/**
 * @author Álvaro Valencia
 * created on 26.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('EditInstanceCtrl', EditInstanceCtrl);

    /** @ngInject */
    function EditInstanceCtrl($http, $q, $state, $stateParams, toastr, Instances) {
        var vm = this;

        // This function contains the form logic
        var form = function (instance, action) {
            //vm.instance = {};
            vm.instance = instance;

            // Default pagination
            vm.mdPagination = {limit: 5, page: 1};

            // Ace editor options
            vm.editorOpts = {
                useWrapMode: true,
                showGutter: true,
                theme: 'dawn',
                mode: 'scala',
                firstLineNumber: 1,
                rendererOptions: {fontSize: 16}
            };

            // Load a model definition page
            vm.loadMdPage = function () {
                $http
                    .get('/api/v1/modelDefinitions?page=' + vm.mdPagination.page + '&limit=' + vm.mdPagination.limit)
                    .then(function (response) {
                        var data = response.data;
                        // Set list of model definitions
                        vm.modelDefinitions = data.docs;
                        // Update pagination data
                        vm.mdPagination = {page: data.page, limit: data.limit, total: data.total};
                    }, function (error) {
                        console.log(error);
                    });
            };

            // Select a model definition and set it to the instance
            vm.selectMd = function (item) {
                vm.selectedMd = item;
                vm.instance.modelDefinition = item._id;
            };

            // submit function
            vm.progressFunction = function () {
                // Transform in, out and ot to array
                if (vm.instance.in && typeof vm.instance.in === "string") vm.instance.in = vm.instance.in.split(',');
                if (vm.instance.out && typeof vm.instance.out === "string") vm.instance.out = vm.instance.out.split(',');
                if (vm.instance.ot && typeof vm.instance.ot === "string") vm.instance.ot = vm.instance.ot.split(',');

                // set default metrics if not set
                if (!vm.instance.metrics) vm.instance.metrics = false;

                // Resolve function
                return $q(function (resolve, reject) {
                    function onSuccess(success){
                        resolve();
                        var actionMsg = action === 'create' ? 'created' : (action ==='edit' ? 'edited' : 'cloned');
                        // toast showing the results
                        toastr.success('The instance has been successfully '+actionMsg+'.', 'Success!', {
                            "positionClass": "toast-top-right",
                            "type": "success",
                            "timeOut": "5000"
                        });
                        $state.go('instances.list', {instance: success});
                    }

                    function onError(error){
                        reject();
                    }

                    if(action === 'edit'){
                        Instances.update({id: vm.instance._id}, vm.instance).$promise.then(onSuccess, onError);
                    } else {
                        if(action === 'clone'){
                            delete vm.instance._id;
                            delete vm.instance.status;
                            delete vm.instance.creationDate;
                            delete vm.instance.lastExecutionDate;
                            delete vm.instance.driverId;
                            delete vm.instance.errorMsg;
                            delete vm.instance.frameworkId;
                        }
                        Instances.create(vm.instance).$promise.then(onSuccess, onError);
                    }

                });
            };

            // called when the controller is loaded
            vm.loadMdPage();

            // If is edit, we must look for the model definition
            if(['edit', 'clone'].includes(action)) {
                $http
                    .get('/api/v1/modelDefinitions/'+vm.instance.modelDefinition)
                    .then(function (response) {
                        vm.selectedMd = response.data;
                    }, function (error) {
                        console.log(error);
                    });
            }
        };

        var currentState = $state.$current.self.name;
        var action = (currentState === 'instances.clone') ? 'clone' : ((currentState === 'instances.edit') ? 'edit' : 'create');

        // When entering to the controller, these statement are first executed
        if (['edit', 'clone'].includes(action)) {
            Instances.get({id: $stateParams.instanceId}).$promise.then(function(instance){form(instance, action)});
        } else {
            form({}, action);
        };
    };
})();