/**
 * @author a.demeshko
 * created on 12/21/15
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.components.tree')
        .controller('treeCtrl', treeCtrl);

    /** @ngInject */
    function treeCtrl($scope, $timeout) {
        var vm = this;

        var newId = 0;

        $scope.dragConfig = {
            'core': {
                'check_callback': function (operation, node, node_parent, node_position, more) {
                    //return (['in', 'ot'].includes(node_parent.id) && !['in', 'ot'].some(x => node.parents.includes(x)) ) ? true : false;
                    return (['in', 'ot'].includes(node.id)) ? false : (['in', 'ot'].includes(node_parent.id) && !['in', 'ot'].some(x => node.parents.includes(x))) ? true : false;
                },
                'themes': {
                    'responsive': false
                },
                //'worker': true,
                //'multiple': false
            },
            'types': {
                'folder': {
                    'icon': 'ion-ios-folder'
                },
                'default': {
                    'icon': 'ion-document-text'
                }
            },
            "plugins": ["dnd", 'types', 'crrm', 'unique'],
            "version": 1
        };

        $scope.removeNode = function () {
            var selected = this.basicTree.jstree(true).get_selected()[0];

            if(!['in', 'ot'].includes(selected)){
                var nodes = this.basicTree.jstree(true)._model.data;
                //delete this.basicTree.jstree(true)._model.data[selected]

                // elimina los nodos en las tripas
                var toDelete = nodes[selected];
                toDelete.children_d.forEach(x => delete this.basicTree.jstree(true)._model.data[x]);
                delete this.basicTree.jstree(true)._model.data[selected]


                console.log($scope.dragData2)
                console.log(this.basicTree.jstree(true)._model.data);

                // cambia el modelo, ya que parece que por dentro no lo hace
                $scope.dragData2 = treeModelToModel(this.basicTree.jstree(true)._model.data)

                // Recarga el arbol
                $scope.dragConfig.version++;
            }
        };

        // Para transformar un nodo en formato interno del arbol al formato del modelo
        function treeModelToModel(treeModel) {
            var result = [];
            Object.keys(treeModel).forEach(function (element) {
                console.log(element)
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
            console.log("showing result")
            console.log(result)
            return result;
        }

        $scope.treeEventsObj = {
            'ready': readyCB
            //'create_node': createNodeCB,
            //'select_node': selectNodeCB   // on node selected callback
        }

        // TODO se llama alc rear el arbol. Lo que hago es guardar en el scope el modelo interno del arbol, y ver cuando se modifica.
        // cuando se modifica, actualizo la lista de nodos (dragData)
        function readyCB() {
            $scope.treeData = this.basicTree.jstree(true)._model.data;

            $scope.$watchCollection('treeData', function (newValue, oldValue) {
                $scope.dragData2 = treeModelToModel(newValue);
            });
        };

        $scope.treeData = getDefaultData();
        $scope.dragData = [
            {
                "id": "nd1",
                "parent": "#",
                "type": "folder",
                "text": "Node 1",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd2",
                "parent": "#",
                "type": "folder",
                "text": "Node 2",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd3",
                "parent": "#",
                "type": "folder",
                "text": "Node 3",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd4",
                "parent": "#",
                "type": "folder",
                "text": "Node 4",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd5",
                "parent": "nd1",
                "text": "Node 1.1",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd6",
                "parent": "nd1",
                "text": "Node 1.2",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd7",
                "parent": "nd1",
                "text": "Node 1.3",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd8",
                "parent": "nd2",
                "text": "Node 2.1",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd9",
                "parent": "nd2",
                "text": "Node 2.2",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd10",
                "parent": "nd2",
                "text": "Node 2.3",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd11",
                "parent": "nd3",
                "text": "Node 3.1",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd12",
                "parent": "nd3",
                "text": "Node 3.2",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd13",
                "parent": "nd3",
                "text": "Node 3.3",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd14",
                "parent": "nd4",
                "text": "Node 4.1",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd15",
                "parent": "nd4",
                "text": "Node 4.2",
                "state": {
                    "opened": true
                }
            },
            {
                "id": "nd16",
                "parent": "nd4",
                "text": "Node 4.3",
                "state": {
                    "opened": true
                }
            }
        ];

        $scope.dragData2 = [
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
                "text": "OT",
                "state": {
                    "opened": true
                }
            }];

        function getDefaultData() {
            return [
                {
                    "id": "n1",
                    "parent": "#",
                    "type": "folder",
                    "text": "Node 1",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n2",
                    "parent": "#",
                    "type": "folder",
                    "text": "Node 2",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n3",
                    "parent": "#",
                    "type": "folder",
                    "text": "Node 3",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n5",
                    "parent": "n1",
                    "text": "Node 1.1",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n6",
                    "parent": "n1",
                    "text": "Node 1.2",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n7",
                    "parent": "n1",
                    "text": "Node 1.3",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n8",
                    "parent": "n1",
                    "text": "Node 1.4",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n9",
                    "parent": "n2",
                    "text": "Node 2.1",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n10",
                    "parent": "n2",
                    "text": "Node 2.2 (Custom icon)",
                    "icon": "ion-help-buoy",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n12",
                    "parent": "n3",
                    "text": "Node 3.1",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n13",
                    "parent": "n3",
                    "type": "folder",
                    "text": "Node 3.2",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n14",
                    "parent": "n13",
                    "text": "Node 3.2.1",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n15",
                    "parent": "n13",
                    "text": "Node 3.2.2",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n16",
                    "parent": "n3",
                    "text": "Node 3.3",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n17",
                    "parent": "n3",
                    "text": "Node 3.4",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n18",
                    "parent": "n3",
                    "text": "Node 3.5",
                    "state": {
                        "opened": true
                    }
                },
                {
                    "id": "n19",
                    "parent": "n3",
                    "text": "Node 3.6",
                    "state": {
                        "opened": true
                    }
                }
            ]
        }


    }
})();