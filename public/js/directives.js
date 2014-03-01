// js/controllers.js
angular.module('gradeDirectives', [])
    .directive('addClassModal', function() {
        return {
            restrict: 'E',
            templateUrl: 'addClassModal.html',
            link: function($scope) {
                $scope.addClass = function() {
                    var newClassName = $scope.newClassName;
                    $scope.newClassName = null;
                    var repeatedName = false;
                    $scope.classList.forEach(function(classRec) {
                        if (classRec.get('name') === newClassName) {
                            repeatedName = true;
                        };
                    })
                    if (!repeatedName) {
                        classTable = $scope._datastore.getTable("classes"); 
                        var newClass = classTable.insert({
                                name: newClassName,
                            });
                        $scope.setCurrentClass(newClass);
                        // $scope.classDict[newClassName] = {};
                        // $scope.$apply();

                        // Dropbox.getDatastore(function(dstore) {
                        //     datastore.getTable("settings").insert({
                        //         name: newClassName,
                        //         isClass: true
                        //     });
                        //     $scope.setCurrentClass(newClassName);
                        //     $scope.classDict[newClassName] = {};
                        //     $scope.$apply();
                        // })
                    }
                    else {
                        $(".temporary-alerts").html(
                "<div class='alert alert-info fade in'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'> &times; </button>  <div class='text-center'> <strong> Class already exists</strong> </div> </div>")
                    };
                };
            }
        };
    })
    .directive('addStudentModal', function() {
        return {
            restrict: 'E',
            templateUrl: 'addStudentModal.html',
            link: function($scope) {
                $scope.addStudent = function() {
                    var studentsTable = $scope._datastore.getTable("students"); 
                    var studentRec = studentsTable.insert({
                        firstName: $scope.studentFirstName,
                        lastName:  $scope.studentLastName,
                        num:       $scope.studentNum,
                        pos:       $scope.currentSeat.position,
                        className: $scope.currentClass.get('name')
                    });
                    $scope.currentSeat.student = studentRec;

                    // old way
                    // Dropbox.getDatastore(function(dstore) {
                    //     var table = dstore.getTable("students");
                    //     var record = table.insert(newStudent);
                    //     newStudent.dropboxID = record.getId();

                    //     delete newStudent["className"];
                    //     $scope.studentDict[newStudent.dropboxID] = newStudent;
                    //     $scope.seats[row][col][0] = newStudent;
                    // });

                    //delete temporary data models
                    $scope.currentSeat = null;
                    $scope.studentFirstName = null;
                    $scope.studentLastName = null;
                    $scope.studentNum = null;
                };
            }
        };
    })
    .directive('editStudentModal', function() {
        return {
            restrict: 'E',
            templateUrl: 'editStudentModal.html',
            link: function($scope) {
                $scope.editStudent = function(deleteRecord) {
                    if (deleteRecord) {
                        $scope.currentSeat.student.deleteRecord();
                        $scope.currentSeat.student = false;
                    }
                    else {
                        $scope.currentSeat.student.update({
                            firstName: $scope.studentFirstName,
                            lastName:  $scope.studentLastName,
                            num:       $scope.studentNum,
                            pos:       $scope.currentSeat.position
                        });
                    }
                    $scope.currentSeat = null;
                    $scope.studentFirstName = null;
                    $scope.studentLastName = null;
                    $scope.studentNum = null;
                };
                $scope.cancelEdit = function() {
                    $scope.currentSeat = null;
                    $scope.studentFirstName = null;
                    $scope.studentLastName = null;
                    $scope.studentNum = null;
                };
            }
        }
    })
    .directive('addAssignmentModal', function() {
        return {
            restrict: 'E',
            templateUrl: 'addAssignmentModal.html',
            link: function($scope) {
                $scope.addAssignment = function() {

                    // new way
                    var scoreTable = $scope._datastore.getTable("scores");
                    var assignmentRecord = scoreTable.insert({
                        "name": $scope.newAssignmentName
                    });
                    $scope.currentAssignment = assignmentRecord;
                    $scope.newAssignmentName = null;

                    // old way
                    // Dropbox.getDatastore(function(dstore) {
                    //     var scoreTable = dstore.getTable("scores");
                    //     var assignmentRecord = scoreTable.insert({
                    //         "name": $scope.newAssignmentName
                    //     });
                    //     var id = assignmentRecord.getId()
                    //     var assignment = {
                    //         name: $scope.newAssignmentName,
                    //         dropboxID: id
                    //     }
                    //     $scope.assignmentDict[id] = assignment;
                    //     $scope.currentAssignment = assignment;
                    //     $scope.newAssignmentName = null;
                    //     $scope.$apply();
                    // });
                };
            }
        };
    })
    .directive('editAssignmentModal', function() {
        return {
            restrict: 'E',
            templateUrl: 'editAssignmentModal.html',
            link: function($scope) {
                $scope.editAssignment = function(deleteRecord) {


                    // new way

                    if (deleteRecord) {
                        $scope.currentAssignment.deleteRecord();
                    }
                    else{
                        $scope.currentAssignment.set("name", $scope.newAssignmentName);
                    };
                    $scope.newAssignmentName = null;

                    // old way

                    // Dropbox.getDatastore(function(dstore) {
                    //     var assignRecord = dstore.getTable("scores").get($scope.currentAssignment.dropboxID);
                    //     if (deleteRecord) {
                    //         if (confirm('Delete assginment "' + $scope.currentAssignment.name + '"?')) {
                    //             console.log('Deleting record...')
                    //             assignRecord.deleteRecord();
                    //             delete $scope.assignmentDict[$scope.currentAssignment.dropboxID];
                    //             delete $scope.currentAssignment;
                    //         };
                    //     }
                    //     else {
                    //         assignRecord.set('name', $scope.newAssignmentName);
                    //         $scope.currentAssignment.name = $scope.newAssignmentName;
                    //     };
                    //     $scope.newAssignmentName = null
                    //     $scope.$apply();
                    // });
                };
                $scope.cancelEdit = function() {
                    $scope.newAssignmentName = null
                };
            }
        };
    })
    .directive('gradeButtons', function() {
        return {
            restrict: 'E',
            scope: {
                student:    '=',
                assignment: '='
            },
            templateUrl: 'gradeButtons.html',
            link: function($scope){
                $scope.enterScore = function(student, score) {
                    student.score = score;

                    var scoreTable = $scope._datastore.getTable("scores");
                    var scoreRecord = scoreTable.getOrInsert($scope.assignment.dropboxID, {});
                    $scope.currentAssignment.set(student.getId(), score);
                    console.log(student.firstName, student.lastName, "score of: ", student.score)

                    // Dropbox.getDatastore(function(dstore) {
                    //     var scoreTable = dstore.getTable("scores");
                    //     var scoreRecord = scoreTable.getOrInsert($scope.assignment.dropboxID, {})
                    //     scoreRecord.set(student.dropboxID, score);
                    //     $scope.assignment[student.dropboxID] = score;
                    //     console.log(student.firstName, student.lastName, "score of: ", student.score)
                    //     $scope.$apply();
                    // });
                };
            }
        };
    })
    .directive('studentView', function() {
        return {
            restrict: 'E',
            templateUrl: 'studentView.html',
            link: function($scope) {
                $scope.setSeat = function(seat) {
                    $scope.currentSeat = seat;
                };
                $scope.editSeat = function(seat) {
                    $scope.currentSeat = seat;
                    $scope.studentFirstName = seat.student.get('firstName');
                    $scope.studentLastName = seat.student.get('lastName');
                    $scope.studentNum = seat.student.get('num');
                };
            }
        };
    })
