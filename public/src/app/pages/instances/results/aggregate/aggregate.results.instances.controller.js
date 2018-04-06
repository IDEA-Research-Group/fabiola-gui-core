/**
 * @author Álvaro Valencia
 * created on 06.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('ResultsAggregateCtrl', ResultsAggregateCtrl);

    /** @ngInject */
    function ResultsAggregateCtrl(Instances, $stateParams, $http, baConfig, layoutPaths) {
        var vm = this;

        var instanceId = $stateParams.instanceId;
        var instance = Instances.get({'id': instanceId});

        vm.instanceId = instanceId;

        vm.instance = instance;

        vm.aggregateConfig = {};

        instance.$promise.then(function (data) {
            var inFields = data.in;
            var outFields = data.out;
            var otFields = data.ot;

            var groupedItems = [];

            inFields.forEach(function (element) {
                groupedItems.push({label: element, value: 'in.' + element, group: 'Input fields'});
            });

            outFields.forEach(function (element) {
                groupedItems.push({label: element, value: 'out.' + element, group: 'Output fields'});
            });

            otFields.forEach(function (element) {
                groupedItems.push({label: element, value: 'ot.' + element, group: 'Other fields'});
            });

            vm.groupedItems = groupedItems;

        }, function (error) {

        });

        vm.operations = [{label: 'Average', value: 'avg'}, {label: 'Sum', value: 'sum'}];
        vm.graphTypes = [{label: 'Map', value: 'map'}, {label: 'Pie chart', value: 'pie'}];

        vm.loadAggResults = function () {
            var groupField = vm.aggregateConfig.groupField;
            var operationField = vm.aggregateConfig.operationField;
            var operation = vm.aggregateConfig.operation;
            var graphType = vm.aggregateConfig.graphType;

            $http.get('/api/v1/results/aggregate/' + instanceId +
                '?groupField=' + groupField.value +
                '&opField=' + operationField.value +
                '&op=' + operation.value)
                .then(function (response) {
                    var results = response.data;

                    console.log(results);

                    vm.display = graphType.value;
                    vm.displayName = graphType.label;

                    if(graphType.value === 'map')
                        vm.displayPieChart(results);
                    else
                        displayMap(results);

                }, function (error) {
                });

            console.log(vm.aggregateConfig)
        };

        vm.displayPieChart = function(results) {

            var layoutColors = baConfig.colors;

            var labels = [];
            var data = [];

            results.forEach(function(element) {
                labels.push(element['_id']);
                data.push(element['result']);
            });


            vm.labels = labels;
            vm.data = data;
            vm.options = {
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        fontColor: layoutColors.defaultText
                    }
                }
            };

        };



        displayMap(null, baConfig.colors, layoutPaths)
    }


    function displayMap(result, layoutColors, layoutPaths){
        console.log("aqui dentro")
/*
        AmCharts.makeChart( "chartdiv", {
            "type": "map",
            "theme": "light",
            "colorSteps": 10,

            "dataProvider": {
                "map": "spainProvincesLow",
                "areas": [ {
                    "id": "ES-AL",
                    "value": 4447100
                }, {
                    "id": "ES-SE",
                    "value": 626932
                }, {
                    "id": "ES-M",
                    "value": 5130632
                }]
            },

            "areasSettings": {
                "autoZoom": true
            },

            "valueLegend": {
                "right": 10,
                "minValue": "little",
                "maxValue": "a lot!"
            },

            "export": {
                "enabled": true
            }

        } );*/

        AmCharts.makeChart('chartid', {
            type: 'map',
            theme: 'light',
            zoomControl: { zoomControlEnabled: false, panControlEnabled: false },

            dataProvider: {
                "map": "spainProvincesLow",
                "areas": [ {
                    "id": "ES-AL",
                    "value": 4447100
                }, {
                    "id": "ES-SE",
                    "value": 626932
                }, {
                    "id": "ES-M",
                    "value": 5130632
                }]
            },

            areasSettings: {
                rollOverOutlineColor: layoutColors.border,
                rollOverColor: layoutColors.primaryDark,
                alpha: 0.8,
                unlistedAreasAlpha: 0.2,
                unlistedAreasColor: layoutColors.defaultText,
                balloonText: '[[title]]: [[customData]] sales'
            },
            export: {
                enabled: true
            },
            creditsPosition: 'bottom-right',
            pathToImages: layoutPaths.images.amChart
        });


    };

})();
