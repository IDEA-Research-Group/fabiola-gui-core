/**
 * @author Álvaro Valencia
 * created on 05.04.2018
 */

(function () {
    'use strict';
    angular
        .module('BlurAdmin.services')
        .service('searchEngine', SearchEngine);

    /** @ngInject */
    function SearchEngine($http) {
        // This list is intended to store the search configs by instance. Structure:
        // {instanceId: <String>,
        //  filer: {field: <String>[represents the query for this field]},
        //  sort: {field: <String>[represents the criteria for this field]}
        // }
        this.searchConfig = {};

        // op can be either filter or sort
        this.updateSearchConfig = function (instanceId, op, field, criteria) {
            if (this.searchConfig.instanceId !== instanceId) this.searchConfig = {instanceId: instanceId};
            if (!this.searchConfig[op]) this.searchConfig[op] = {};

            if (/\S/.test(criteria)) {
                // Splits the criteria in two if it contains two comparing symbols. Otherwise, it doesn't modify the
                // original value
                criteria = splitQuery(field, criteria);
                var queryStr = (!['<', '>', '=', '!'].includes(criteria.charAt(0))) ? field + '=' + criteria : field + criteria;
                this.searchConfig[op][field] = queryStr;
            } else
                this.removeSearchConfig(instanceId, op, field);
        };

        this.removeSearchConfig = function (instanceId, op, field) {
            if(this.searchConfig[op]) if (this.searchConfig[op][field]) delete this.searchConfig[op][field];
        };

        this.execute = function (instanceId, pagination, sortCriteria, callback, errorCallback) {
            var query = this.buildQuery();
            var sort = '';

            // Build the sort query
            if(sortCriteria.predicate){
                sort = sortCriteria.reverse ? '&sort='+sortCriteria.predicate : '&sort=-'+sortCriteria.predicate;
            }

            $http
                .get('/api/v1/results/'+instanceId+'?limit=' + pagination.limit + '&page=' + pagination.page+query+sort)
                .then(function (response) {
                    callback(response);
                }, function (error) {
                    errorCallback(error);
                });
        };

        this.buildQuery = function() {
            var query = '';

            var filter = this.searchConfig.filter;
            if(filter) {
                Object.keys(filter).forEach(function(field) {
                    query += '&'+filter[field];
                });
            }

            return query;
        }

        // used to split the query if it has two comparing symbols
        function splitQuery(field, criteria) {
            var firstOperator = criteria.charAt(0);

            var index = (firstOperator === '!') ? criteria.lastIndexOf('!') : (firstOperator === '>') ? criteria.lastIndexOf('<') : criteria.lastIndexOf('>');
            //var index = (firstOperator === '>') ? criteria.lastIndexOf('<') : criteria.lastIndexOf('>');

            return (index !==-1) ?
                (criteria.substring(0, index) + '&' + field + criteria.substring(index, criteria.length)) :
                criteria;
        }

    };
})();