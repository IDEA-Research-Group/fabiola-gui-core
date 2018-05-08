/**
 * @author Álvaro Valencia
 * created on 26.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('EditInstanceCtrl', EditInstanceCtrl);

    /** @ngInject */
    function EditInstanceCtrl($http, $q, $state, $stateParams, toastr, Instances, $scope) {
        var vm = this;
        var treeScope;

        // This function contains the form logic
        var form = function (instance, action) {
            //vm.instance = {};
            vm.instance = instance;

            // Default pagination
            vm.mdPagination = {limit: 5, page: 1};
            vm.datasetPagination = {limit: 5, page: 1};

            // Ace editor options
            vm.editorOpts = {
                useWrapMode: true,
                showGutter: true,
                theme: 'dawn',
                mode: 'scala',
                firstLineNumber: 1,
                rendererOptions: {fontSize: 16}
            };

            // Load schema
            var loadSchema = function() {
                // Load the dataset schema with the right format
                var schemaObj = JSON.parse(vm.selectedDataset.dsSchema);
                var transformedTree = transformTree(schemaObj.fields, '#', 0);

                // tree configs
                vm.dsSchemaConfig = {
                    'core': {
                        'check_callback': false,
                        'themes': {'responsive': true}
                    },
                    'types': {'folder': {'icon': 'ion-ios-folder'},
                        'default': {'icon': 'ion-document-text'}
                    },
                    "plugins": ["dnd", 'types', 'crrm', 'unique'],
                    "version": 1
                };

                vm.dragConfig = {
                    'core': {
                        'check_callback': function (operation, node, node_parent, node_position, more) {
                            return (['in', 'ot'].includes(node.id)) ? false : (['in', 'ot'].includes(node_parent.id) && !['in', 'ot'].some(x => node.parents.includes(x))) ? true : false;
                        },
                        'themes': {'responsive': true}
                    },
                    'types': {'folder': {'icon': 'ion-ios-folder'},
                              'default': {'icon': 'ion-document-text'}
                    },
                    "plugins": ["dnd", 'types', 'crrm', 'unique'],
                    "version": 1
                };

                // set the schemas
                vm.dsSchema = transformedTree;
                vm.inOtTree = [
                    {
                        "id": "in",
                        "parent": "#",
                        "type": "folder",
                        "text": "IN",
                        "state": {
                            "opened": true
                        }
                    },
                    {
                        "id": "ot",
                        "parent": "#",
                        "type": "folder",
                        "text": "OTHER",
                        "state": {
                            "opened": true
                        }
                    }];
            };
            /*
            * Inicio
            * */

            // Events (just the ready event, called on tree load)
            vm.treeEventsObj = {'ready': readyCB};
            // TODO se llama alc rear el arbol. Lo que hago es guardar en el scope el modelo interno del arbol, y ver cuando se modifica.
            // cuando se modifica, actualizo la lista de nodos (dragData)
            function readyCB() {
                treeScope = this; // Carga el scope del arbol
                // Load the tree internal model
                vm.treeData = treeScope.basicTree.jstree(true)._model.data;
                // When the internal model changes, it regenerates the vm treeData model
                $scope.$watchCollection('vm.treeData', function (newValue, oldValue) {
                    vm.inOtTree = treeModelToModel(newValue);
                });
            };

            vm.removeNode = function () {
                var selected = treeScope.basicTree.jstree(true).get_selected()[0];
                if(!['in', 'ot'].includes(selected)){
                    var nodes = treeScope.basicTree.jstree(true)._model.data;

                    // elimina los nodos en las tripas
                    var toDelete = nodes[selected];
                    toDelete.children_d.forEach(x => delete treeScope.basicTree.jstree(true)._model.data[x]);
                    delete treeScope.basicTree.jstree(true)._model.data[selected];

                    // cambia el modelo, ya que parece que por dentro no lo hace
                    vm.inOtTree = treeModelToModel(treeScope.basicTree.jstree(true)._model.data);

                    // Recarga el arbol
                    vm.dragConfig.version++;
                }
            };

            // Para transformar un nodo en formato interno del arbol al formato del modelo
            function treeModelToModel(treeModel) {
                var result = [];
                Object.keys(treeModel).forEach(function (element) {
                    if (element !== '#') {
                        result.push({
                            id: treeModel[element].id,
                            parent: treeModel[element].parent,
                            state: {opened: treeModel[element].state.opened},
                            text: treeModel[element].text,
                            type: treeModel[element].type
                        });
                    }
                });
                return result;
            }
            /*
            * Fin
            * */



            vm.loadSchema = loadSchema;

            // Load a cop model page
            vm.loadMdPage = function () {
                $http
                    .get('/api/v1/copModels?page=' + vm.mdPagination.page + '&limit=' + vm.mdPagination.limit)
                    .then(function (response) {
                        var data = response.data;
                        // Set list of cop models
                        vm.copModels = data.docs;
                        // Update pagination data
                        vm.mdPagination = {page: data.page, limit: data.limit, total: data.total};
                    }, function (error) {
                        console.log(error);
                    });
            };

            // Load a dataset page
            vm.loadDatasetPage = function() {
                $http
                    .get('/api/v1/datasets?page=' + vm.datasetPagination.page + '&limit=' + vm.datasetPagination.limit + '&status=VALIDATED')
                    .then(function (response) {
                        var data = response.data;
                        // Set list of cop models
                        vm.datasets = data.docs;
                        // Update pagination data
                        vm.datasetPagination = {page: data.page, limit: data.limit, total: data.total};
                    }, function (error) {
                        console.log(error);
                    });
            };

            // Select a cop model and set it to the instance
            vm.selectMd = function (item) {
                vm.selectedCM = item;
                vm.instance.copModel = item._id;
            };

            // Select a dataset and set it to the instance
            vm.selectDataset = function(item) {
                vm.selectedDataset = item;
                vm.instance.dataset = item._id;
                loadSchema();
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
                            delete vm.instance.errorMsg;
                        }
                        Instances.create(vm.instance).$promise.then(onSuccess, onError);
                    }

                });
            };

            // called when the controller is loaded
            vm.loadMdPage();
            vm.loadDatasetPage();

            // If is edit, we must look for the cop model and dataset
            if(['edit', 'clone'].includes(action)) {
                $http
                    .get('/api/v1/copModels/'+vm.instance.copModel._id)
                    .then(function (response) {
                        vm.selectedCM = response.data;
                    }, function (error) {
                        console.log(error);
                    });

                $http
                    .get('/api/v1/datasets/'+vm.instance.dataset._id)
                    .then(function (response) {
                        vm.selectedDataset = response.data;
                        loadSchema();
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


    function transformTree(nodes, parent, parentId) {
        var treeNodes = [];
        var idCount = 0;
        nodes.forEach(n => {
                treeNodes.push({
                    id: parentId === 0 ? String(idCount) : parentId + '.' + idCount,
                    parent: parentId === 0 ? '#' : parentId,
                    text: n.name,
                    state: {opened: true},
                    type: (['struct', 'array'].includes(getNodeType(n.type))? 'folder' : undefined)
                });

                var childNodes = [];
                if(getNodeType(n.type) === 'struct')
                    childNodes = transformTree(n.type.fields, n.name, parentId === 0 ? idCount : parentId + '.' + idCount);
                else if(getNodeType(n.type) === 'array')
                    childNodes = transformTree(n.type.elementType.fields, n.name, parentId === 0 ? idCount : parentId + '.' + idCount);


                idCount ++;

                treeNodes = treeNodes.concat(childNodes);
            }
        );
        return treeNodes;
    }

    function getNodeType(type) {
        return typeof type === 'object' ? type.type : type;
    }

})();