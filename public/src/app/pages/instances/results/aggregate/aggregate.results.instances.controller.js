/**
 * @author Álvaro Valencia
 * created on 06.04.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .controller('ResultsAggregateCtrl', ResultsAggregateCtrl);

    /** @ngInject */
    function ResultsAggregateCtrl(Instances, $stateParams, $http, baConfig, layoutPaths, $timeout) {
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

                    vm.display = graphType.value;
                    vm.displayName = graphType.label;

                    if (graphType.value === 'pie')
                        vm.displayPieChart(results);
                    else
                        vm.displayMap(results);

                }, function (error) {
                });

        };

        vm.displayPieChart = function (results) {
            var layoutColors = baConfig.colors;

            var labels = [];
            var data = [];

            results.forEach(function (element) {
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

        vm.displayMap = function (results) {
            var idTitles = AmCharts.maps.spainProvincesLow.svg.g.path.filter(function(x) {
                return x.title && x.id
            });

            function locationNameToId(meta, locationName) {
                return meta
                    .map(function(y){return [y.id, similarity(locationName, y.title)]})
                    .reduce(function(prev, current) {return (prev[1] > current[1]) ? prev : current})[0];
            }

            var data = results
                .map(function(x) {
                    return {
                        id: locationNameToId(idTitles, x._id), value: x.result
                    }
                });

            var layoutColors = baConfig.colors;

            var map;
            AmCharts.theme = AmCharts.themes.blur;
            map = new AmCharts.AmMap();

            map.areasSettings = {
                autoZoom: true,
                rollOverOutlineColor: layoutColors.border,
                rollOverColor: layoutColors.primaryDark,
                alpha: 0.8,
                unlistedAreasAlpha: 0.2,
                unlistedAreasColor: layoutColors.defaultText,
                balloonText: '[[title]]: [[value]]'
            };

            map.pathToImages = layoutPaths.images.amMap;

            var dataProvider = {
                mapVar: AmCharts.maps.spainProvincesLow,
                type: 'map',
                areas: data
            };

            map.dataProvider = dataProvider;

            $timeout(function () {
                map.write('map-bubbles');
            }, 100);
        };
    }

    function stripAccents(str) {
        var reAccents = /[àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ]/g;
        var replacements = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY';
        return str.replace(reAccents, function (match) {
            return replacements[reAccents.source.indexOf(match)];
        });
    };

    function editDistance(s1, s2) {
        s1 = stripAccents(s1.toLowerCase());
        s2 = stripAccents(s2.toLowerCase());

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    function similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

})();
