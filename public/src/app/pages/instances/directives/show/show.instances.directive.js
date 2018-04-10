/**
 * @author Álvaro Valencia
 * created on 22.03.2018
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.instances')
        .directive('showInstance', ShowInstanceDirective);

    /** @ngInject */
    function ShowInstanceDirective($http, Instances, $state, toastr, $interval) {
        return {
            restrict: 'E',
            scope: {
                instanceId: '='
            },
            templateUrl: 'app/pages/instances/directives/show/show.html',
            link: function (scope, elem, attr) {

                scope.$watch('instanceId', function (newValue, attrs) {
                    if (newValue) {
                        scope.instance = Instances.get({'id': newValue});
                    }
                }, true);

                scope.runInstance = function (instance) {
                    var id = instance._id;
                    $http
                        .post('/api/v1/instances/run/' + id, {})
                        .then(function (data) {
                            toastr.success('The instance now is running.', 'Success!', {
                                "positionClass": "toast-top-right",
                                "type": "success",
                                "timeOut": "5000"
                            });
                            scope.instance = Instances.get({'id': id});
                        }, function (error) {
                        });
                }

                var intervalPromise = $interval(function () {
                    if (scope.instance) {
                        var id = scope.instance._id;
                        if (scope.instance.status === 'RUNNING') {
                            $http
                                .get('/api/v1/instances/status/' + id)
                                .then(function (response) {
                                    scope.instance = response.data;
                                }, function (error) {
                                });
                        }
                    }
                }, 10000);

                elem.on('$destroy', function () {
                    $interval.cancel(intervalPromise);
                });
            }
        }
    }
})();
