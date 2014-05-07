angular.module('gradeDragDrop', ['ngDragDrop'])
  .controller('oneCtrl', function($scope, $timeout, $filter) {
    $scope.filterIt = function() {
      return $filter('orderBy')($scope.list2, 'title');
    };
    $scope.list1 = [];
    $scope.list2 = [
      { 'title': 'Item 3', 'drag': true },
      { 'title': 'Item 2', 'drag': true },
      { 'title': 'Item 1', 'drag': true },
      { 'title': 'Item 4', 'drag': true }
    ];
    angular.forEach($scope.list2, function(val, key) {
      $scope.list1.push({});
    });
  });