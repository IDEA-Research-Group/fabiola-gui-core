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
        var originalTreeVersion = 1;
        var basicTreeVersion = 1;
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
            var loadSchema = function () {
                originalTreeVersion++;
                basicTreeVersion++;

                var schemaObj = JSON.parse(vm.selectedDataset.dsSchema); // Takes the dsSchema String and transforms it to a JSON object
                var transformedTree = transformTree(schemaObj.fields, '#', 0, '#'); // Transform the schema in the high-level js-tree format

                // Node id's that represent a collection
                let idCollectionNodes = transformedTree.filter(x => x.type === 'collection').map(x => x.id);

                // This configuration is for the tree that show the DS schema. Dragging is not allowed.
                vm.dsSchemaConfig = {
                    'core': {
                        'check_callback': false,
                        'themes': {'responsive': true}
                    },
                    'types': {
                        'folder': {'icon': 'ion-more'},
                        'default': {'icon': 'ion-ios-circle-filled'},
                        'collection': {'icon': 'ion-ios-browsers-outline'}
                    },
                    "plugins": ["dnd", 'types', 'crrm', 'unique'],
                    "version": originalTreeVersion
                };

                // This is the configuration of the IN/OUT tree. The check_callback function is configured to allow to
                // drag nodes only if their parents or ancestors are not in or ot
                vm.dragConfig = {
                    'core': {
                        'check_callback': function (operation, node, node_parent, node_position, more) {
                            return (['in', 'ot'].includes(node.id)) ? false : (['in', 'ot'].includes(node_parent.id) && !['in', 'ot'].some(x => node.parents.includes(x)) && !idCollectionNodes.some(x => node.parents.includes(x)));
                        },
                        'themes': {'responsive': true}
                    },
                    'types': {
                        'folder': {'icon': 'ion-more'},
                        'default': {'icon': 'ion-ios-circle-filled'},
                        'collection': {'icon': 'ion-ios-browsers-outline'}
                    },
                    "plugins": ["dnd", 'types', 'crrm', 'unique'],
                    "version": basicTreeVersion
                };

                // set the schemas
                vm.dsSchema = transformedTree; // DS Schema tree
                vm.inOtTree = [
                    {
                        "id": "in",
                        "parent": "#",
                        "type": "folder",
                        "path": "#",
                        "text": "IN",
                        "state": {
                            "opened": true
                        }
                    },
                    {
                        "id": "ot",
                        "parent": "#",
                        "type": "folder",
                        "path": "#",
                        "text": "OTHER",
                        "state": {
                            "opened": true
                        }
                    }]; // IN/OUT tree

                //if(treeScope) treeScope.originalTree.jstree("refresh")//treeScope.basicTree.jstree(true).refresh();
                //if(treeScope) //treeScope.originalTree.jstree(true).refresh();
            };

            /*
            * Inicio
            * */

            // This function is intended to be called when the tree/s is/are created. It is set in the js-tree
            // tree-events-obj attribute as a JSON object, in the property 'ready'.
            // When the readyCB is created, saves the js-tree scope in the treeScope var. Then, watches the internal
            // tree model for changes. If there's some change, calls the treeModelToModel, in order to transform the
            // inOtTree high level structure
            function readyCB() {
                treeScope = this; // Tree scope. It's necessary to save it in order to access to the internal structure
                // Load the tree internal model
                vm.treeData = treeScope.basicTree.jstree(true)._model.data;
                // When the internal model changes, it regenerates the vm treeData model
                $scope.$watchCollection('vm.treeData', function (newValue, oldValue) {
                    vm.inOtTree = treeModelToModel(newValue);
                    console.log(newValue)
                    console.log(vm.inOtTree)
                });
            }

            // Events (just the ready event, called on tree load)
            vm.treeEventsObj = {'ready': readyCB};

            // Called on node removal
            vm.removeNode = function () {
                // Get the selected node
                var selected = treeScope.basicTree.jstree(true).get_selected()[0];
                if (selected) {
                    // Cannot delete nodes whose id are in or ot
                    if (!['in', 'ot'].includes(selected)) {
                        // Get the node list. Then, find the node to deleted with all the metadata, including the
                        // children nodes
                        var nodes = treeScope.basicTree.jstree(true)._model.data;
                        var toDelete = nodes[selected];

                        // Delete the node to delete and all its children
                        toDelete.children_d.forEach(x => delete treeScope.basicTree.jstree(true)._model.data[x]);
                        delete treeScope.basicTree.jstree(true)._model.data[selected];

                        // Changes the high level tree model
                        vm.inOtTree = treeModelToModel(treeScope.basicTree.jstree(true)._model.data);

                        // Updates the tree
                        vm.dragConfig.version++;
                    }
                }
            };

            // Transforms an internal tree model to a high level tree model
            function treeModelToModel(treeModel) {
                var result = [];
                Object.keys(treeModel).forEach(function (element) {
                    if (element !== '#') {
                        result.push({
                            id: treeModel[element].id,
                            parent: treeModel[element].parent,
                            state: {opened: treeModel[element].state.opened},
                            li_attr: Object.assign({}, treeModel[element].li_attr,
                                {
                                    // Add two properties indicating whether the node has children and the root in the inOtTree
                                    // These properties are consulted when generating the vm.instance.in and vm.instance.ot lists
                                    hasChildren: treeModel[element].children[0] != null,
                                    root: treeModel[element].parents.includes('in') ? 'in' : treeModel[element].parents.includes('ot') ? 'ot' : '#'
                                }),
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


            /*
            * instance.in and instance.ot TREATMENT
            * */
            /*
            * Watches for changes in vm.inOtTree. If changes are performed in the in/other tree structure, it
            * makes those changes in the instance.in and instance.ot arrays
            * */
            $scope.$watchCollection('vm.inOtTree', function (newValue, oldValue) {
                if (newValue) {
                    vm.instance.in = filterNodesAndGetUniquePaths(newValue, 'in');
                    vm.instance.ot = filterNodesAndGetUniquePaths(newValue, 'ot');
                }
            });

            // Utility function to get the in and ot array from the tree high level model "inOtTree"
            function filterNodesAndGetUniquePaths(array, root) {
                // filter: only add those nodes that:
                // don't have children or its type is collection AND
                // the root node is the requested one (expected to be in or other) AND
                // it's not child of a node whose type is collection
                let allPaths = array
                    .filter(x => x.li_attr ? (!x.li_attr.hasChildren || x.type === 'collection') && x.li_attr.root === root && !isChildOfCollection(array, x) : false)
                    .map(x => x.li_attr.path);
                return allPaths.filter((value, index) => allPaths.indexOf(value) === index);
            }
            // Return true if the node node is child or grandchild of a node of type collection
            function isChildOfCollection(array, node) {
                let candidates = array.filter(x => x.id === node.parent);
                if (!candidates[0]) {
                    return false;
                } else {
                    let parent = candidates[0];
                    if (parent.type === "collection") return true; else return isChildOfCollection(array, parent);
                }
            }

            /*
            * End.
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
            vm.loadDatasetPage = function () {
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
            vm.selectDataset = function (item) {
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
                    function onSuccess(success) {
                        resolve();
                        var actionMsg = action === 'create' ? 'created' : (action === 'edit' ? 'edited' : 'cloned');
                        // toast showing the results
                        toastr.success('The instance has been successfully ' + actionMsg + '.', 'Success!', {
                            "positionClass": "toast-top-right",
                            "type": "success",
                            "timeOut": "5000"
                        });
                        $state.go('instances.list', {instance: success});
                    }

                    function onError(error) {
                        reject();
                    }

                    if (action === 'edit') {
                        Instances.update({id: vm.instance._id}, vm.instance).$promise.then(onSuccess, onError);
                    } else {
                        if (action === 'clone') {
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
            if (['edit', 'clone'].includes(action)) {
                $http
                    .get('/api/v1/copModels/' + vm.instance.copModel._id)
                    .then(function (response) {
                        vm.selectedCM = response.data;
                    }, function (error) {
                        console.log(error);
                    });

                $http
                    .get('/api/v1/datasets/' + vm.instance.dataset._id)
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
            Instances.get({id: $stateParams.instanceId}).$promise.then(function (instance) {
                form(instance, action)
            });
        } else {
            form({}, action);
        }
    }


    /*
    * Can be moved to an external module
    * */
    function transformTree(nodes, parent, parentId, parentPath) {
        let treeNodes = [];
        let idCount = 0;
        nodes.forEach(n => {
                let thisPath = (parentPath === '#') ? n.name : parentPath + '.' + n.name;
                treeNodes.push({
                    id: parentId === 0 ? String(idCount) : parentId + '.' + idCount,
                    parent: parentId === 0 ? '#' : parentId,
                    text: n.name,
                    li_attr: {"path": thisPath},
                    state: {opened: true},
                    type: getNodeType(n.type) === 'struct' ? 'folder' : getNodeType(n.type) === 'array' ? 'collection' : undefined
                });

                let childNodes = [];
                if (getNodeType(n.type) === 'struct')
                    childNodes = transformTree(n.type.fields, n.name, parentId === 0 ? idCount : parentId + '.' + idCount, thisPath);
                else if (getNodeType(n.type) === 'array')
                    childNodes = transformTree(n.type.elementType.fields, n.name, parentId === 0 ? idCount : parentId + '.' + idCount, thisPath);

                idCount++;
                treeNodes = treeNodes.concat(childNodes);
            }
        );
        return treeNodes;
    }

    function getNodeType(type) {
        return typeof type === 'object' ? type.type : type;
    }

})();