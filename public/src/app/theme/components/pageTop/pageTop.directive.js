/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop($http, $rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
      link: function (scope, element, attrs) {
        if(!$rootScope.version){
          $http.get('/api/v1/getVersion').then(function(response){
            $rootScope.version = response.data;
          }, function(error){});
        }
      }
    };
  }

})();