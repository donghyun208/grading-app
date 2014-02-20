angular.module('gradeFilters', [])
    .filter('orderObjectBy', function($filter){
        return function(input, attribute) {
            if (!angular.isObject(input)) return input;
            var array = [];
            for(var objectKey in input) {
                array.push(input[objectKey]);
            }
            return $filter('orderBy')(array, attribute);
        }
    });