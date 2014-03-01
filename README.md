hello

Three tables are maintained on the Dropbox server:
  * students
  * classes
  * assignments

These are kept in sync client side using the following arrays:
  * $scope.studentList
  * $scope.classList
  * $scope.assignmentList

Changes to any Dropbox.Records should be done directly to the Record. Additions of new Records should be done by accessing the Dropbox.Table using using $scope._datastore.get("tableName").
Any changes will be automatically updated on the Dropbox server, and also on the client side "$scope.someList" arrays. There should be no need to manually remove or update an element from "$scope.someList".