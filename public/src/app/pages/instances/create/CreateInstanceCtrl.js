(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('CreateInstanceCtrl', CreateInstanceCtrl);

    /** @ngInject */
    function CreateInstanceCtrl($http, $q, $state, toastr) {
        var vm = this;

        vm.instance = {};

        // Default pagination
        vm.mdPagination = {limit: 5, page: 1}

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
        vm.progressFunction = function() {
            // Transform in, out and ot to array
            if (vm.instance.in && typeof vm.instance.in === "string"  ) vm.instance.in = vm.instance.in.split(',');
            if (vm.instance.out && typeof vm.instance.out === "string" ) vm.instance.out = vm.instance.out.split(',');
            if (vm.instance.ot && typeof vm.instance.ot === "string") vm.instance.ot = vm.instance.ot.split(',');

            // set default metrics if not set
            if (!vm.instance.metrics) vm.instance.metrics = false;

            // Resolve function
            return $q(function(resolve, reject) {
                $http
                    .post('/api/v1/instances', vm.instance)
                    .then(function(response) {
                        resolve();
                        // toast showing the results
                        toastr.success('The instance has been successfully created.', 'Success!', {
                            "autoDismiss": false,
                            "positionClass": "toast-top-right",
                            "type": "success",
                            "timeOut": "5000",
                            "extendedTimeOut": "2000",
                            "allowHtml": false,
                            "closeButton": false,
                            "tapToDismiss": true,
                            "progressBar": false,
                            "newestOnTop": true,
                            "maxOpened": 0,
                            "preventDuplicates": false,
                            "preventOpenDuplicates": false
                        });
                        $state.go('instances.list', {instance: response.data});
                    }, function(error) {

                        var message = "An unexpected error has occurred. Please try again later."
                        // If error is due to unprocessable entity then show the validation errors
                        if (error.status === 422) {
                            message = "There are errors on your form: \n"+error.data.error;
                        }
                        // Show the error notification
                        toastr.error(message, 'Error', {
                            "autoDismiss": false,
                            "positionClass": "toast-top-right",
                            "type": "error",
                            "timeOut": "10000",
                            "extendedTimeOut": "2000",
                            "allowHtml": false,
                            "closeButton": false,
                            "tapToDismiss": true,
                            "progressBar": false,
                            "newestOnTop": true,
                            "maxOpened": 0,
                            "preventDuplicates": false,
                            "preventOpenDuplicates": false
                        });
                        reject();
                    });
            });
        };

        // called when the controller is loaded
        vm.loadMdPage();
    };

})();