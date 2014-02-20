// js/controllers.js
angular.module('gradeDirectives', [])
    .directive('addClass', function(Dropbox) {
        return {
            restrict: 'E',
            templateUrl: 'addNewClass.html',
            link: function($scope) {
                $scope.addClass = function() {
                    var newClassName = $scope.newClassName;
                    $scope.newClassName = null;
                    if (!$scope.classDict.hasOwnProperty(newClassName)){
                        Dropbox.getDatastore(function(dstore) {
                            datastore.getTable("settings").insert({
                                name: newClassName,
                                isClass: true
                            });
                            $scope.setCurrentClass(newClassName);
                            $scope.classDict[newClassName] = {};
                            $scope.$apply();
                        })
                    }
                    else {
                        $(".temporary-alerts").html(
                "<div class='alert alert-info fade in'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'> &times; </button>  <div class='text-center'> <strong> Class already exists</strong> </div> </div>")
                    };
                };
            }
        };


    })
    .directive('addStudent', function(Dropbox) {
        return {
            restrict: 'E',
            templateUrl: 'addNewStudent.html',
            link: function($scope) {
                $scope.addStudent = function() {
                    var row = $scope.currRow;
                    var col = $scope.currCol;
                    var newStudent = {
                        firstName: $scope.studentFirstName,
                        lastName: $scope.studentLastName,
                        num: $scope.studentNum,
                        pos: [row, col],
                        className: $scope.currentClass
                    }
                    Dropbox.getDatastore(function(dstore) {
                        var table = dstore.getTable("students");
                        var record = table.insert(newStudent);
                        newStudent.dropboxID = record.getId();

                        delete newStudent["className"];
                        $scope.studentDict[newStudent.dropboxID] = newStudent;
                        $scope.seats[row][col][0] = newStudent;
                    });

                    //delete temporary data models
                    $scope.currRow = null;
                    $scope.currCol = null;
                    $scope.studentFirstName = null;
                    $scope.studentLastName = null;
                    $scope.studentNum = null;
                };
            }
        };
    })
    .directive('editStudent', function() {
        return {
            restrict: 'E',
            templateUrl: 'editStudent.html',
            link: function($scope) {
                $scope.editStudent = function(deleteRecord) {
                    var row = $scope.currRow;
                    var col = $scope.currCol;
                    var dropboxID = $scope.currStudent.dropboxID;
                    var updatedStudent = {
                        firstName: $scope.studentFirstName,
                        lastName: $scope.studentLastName,
                        num: $scope.studentNum,
                        pos: [row, col],
                        dropboxID: dropboxID
                    }
                    $scope.seats[row][col][0] = updatedStudent;

                    Dropbox.getDatastore(function(dstore) {
                        var table = dstore.getTable('students');
                        var record = table.get(dropboxID);
                        if (deleteRecord) {
                            record.deleteRecord();
                            $scope.seats[row][col][0] = false;
                            delete $scope.studentDict[dropboxID]
                            $scope.$apply();
                        }
                        else {
                            record.update(updatedStudent);
                        }
                    });
                    $scope.currRow = null;
                    $scope.currCol = null;
                    $scope.studentFirstName = null;
                    $scope.studentLastName = null;
                    $scope.studentNum = null;
                    $scope.currStudent = null;
                };
                $scope.cancelEdit = function() {
                    $scope.currRow = null;
                    $scope.currCol = null;
                    $scope.studentFirstName = null;
                    $scope.studentLastName = null;
                    $scope.studentNum = null;
                };
            }
        }
    })
    .directive('addAssignment', function(Dropbox) {
        return {
            restrict: 'E',
            templateUrl: 'addNewAssignment.html',
            link: function($scope) {
                $scope.addAssignment = function() {
                    Dropbox.getDatastore(function(dstore) {
                        var scoreTable = dstore.getTable("scores");
                        var assignmentRecord = scoreTable.insert({
                            "name": $scope.newAssignmentName
                        });
                        var id = assignmentRecord.getId()
                        var assignment = {
                            name: $scope.newAssignmentName,
                            dropboxID: id
                        }
                        $scope.assignmentDict[id] = assignment;
                        $scope.currentAssignment = assignment;
                        $scope.newAssignmentName = null;
                        $scope.$apply();
                    });
                };
            }
        };
    })
    .directive('editAssignment', function(Dropbox) {
        return {
            restrict: 'E',
            templateUrl: 'editAssignment.html',
            link: function($scope) {
                $scope.editAssignment = function(deleteRecord) {
                    Dropbox.getDatastore(function(dstore) {
                        var assignRecord = dstore.getTable("scores").get($scope.currentAssignment.dropboxID);
                        if (deleteRecord) {
                            if (confirm('Delete assginment "' + $scope.currentAssignment.name + '"?')) {
                                console.log('Deleting record...')
                                assignRecord.deleteRecord();
                                delete $scope.assignmentDict[$scope.currentAssignment.dropboxID];
                                delete $scope.currentAssignment;
                            };
                        }
                        else {
                            assignRecord.set('name', $scope.newAssignmentName);
                            $scope.currentAssignment.name = $scope.newAssignmentName;
                        };
                        $scope.newAssignmentName = null
                        $scope.$apply();
                    });
                };
                $scope.cancelEdit = function() {
                    $scope.newAssignmentName = null
                };
            }
        };
    })
    .directive('gradeButtons', function(Dropbox) {
        return {
            restrict: 'E',
            scope: {
                student:    '=',
                assignment: '='
            },
            templateUrl: 'gradeButtons.html',
            link: function($scope){
                $scope.enterScore = function(student, score){
                    student.score = score;
                    Dropbox.getDatastore(function(dstore) {
                        var scoreTable = dstore.getTable("scores");
                        var scoreRecord = scoreTable.getOrInsert($scope.assignment.dropboxID, {})
                        scoreRecord.set(student.dropboxID, score);
                        $scope.assignment[student.dropboxID] = score;
                        console.log(student.firstName, student.lastName, "score of: ", student.score)
                        $scope.$apply();
                    });
                };
            }
        };
    });