// js/directives.js
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
                    }
                    else {
                        $(".temporary-alerts").html(
                "<div id='dupeClassWarning' class='alert alert-info fade in'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'> &times; </button>  <div class='text-center'> <strong> Class already exists</strong> </div> </div>")
                        setTimeout(function() {
                            $("#dupeClassWarning").fadeOut('slow', function() {$(".temporary-alerts").empty()});
                            }, 2000);
                    };
                };

                $scope.setCurrentClass = function(classRec) {
                    $scope.currentClass = classRec;
                    var className = classRec.get('name');
                    var row_list = [];
                    var col_list = [];
                    $scope.viewType = 'seating';
                    $scope.currentStudents = [];
                    $scope.studentList.forEach(function(studentRec) {
                        if (studentRec.get('className') === className) {
                            $scope.currentStudents.push(studentRec);
                            row_list.push(studentRec.get('pos').get(0));
                            col_list.push(studentRec.get('pos').get(1));
                        }
                    });

                    if (row_list.length === 0) {
                        var row_max = 8;
                        var col_max = 4;
                    }
                    else {
                        var row_max = Math.max.apply(Math, row_list) + 1;
                        var col_max = Math.max.apply(Math, col_list) + 1;
                    };

                    // create the seating matrix
                    $scope.seats = [];
                    for (var row=0; row<row_max; row++) {
                        $scope.seats.push([])
                        for (var col=0; col<col_max; col++) {
                            $scope.seats[row].push({
                                student: false,
                                grade: null,
                                position: [row, col]
                            });
                        };
                    };

                    // populate the seating matrix
                    $scope.currentStudents.forEach(function(studentRec) {
                        var row = studentRec.get('pos').get(0);
                        var col = studentRec.get('pos').get(1);
                        $scope.seats[row][col].student = studentRec;
                    });
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
                    var newAssignment = $scope._datastore.getTable("assignments").insert({
                        "name": $scope.newAssignmentName
                    });
                    $scope.setCurrentAssignment(newAssignment);
                    $scope.newAssignmentName = null;
                };

                $scope.setCurrentAssignment = function(assignment) {
                    $scope.currentAssignment = assignment;
                    var assignID = assignment.getId();
                    $scope.seats.forEach(function(row) {
                        row.forEach(function(seat) {
                            if (seat.student !== false) {
                                var grade = seat.student.get(assignID);
                                seat.grade = grade;
                            };
                        });
                    });
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
                    if (deleteRecord) {
                        $scope.currentAssignment.deleteRecord();
                    }
                    else{
                        $scope.currentAssignment.set("name", $scope.newAssignmentName);
                    };
                    $scope.newAssignmentName = null;
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
            templateUrl: 'gradeButtons.html',
            link: function($scope){
                $scope.enterGrade = function(grade) {
                    // seat.student = ;
                    $scope.seat.grade = grade;
                    var assignID = $scope.currentAssignment.getId();
                    var student = $scope.seat.student;
                    student.set(assignID, grade);
                    console.log(student.get('firstName'), student.get('lastName'), "grade of: ", grade)
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
                $scope.deleteClass = function() {
                    if (confirm('Delete class "' + $scope.currentClass.get('name') + '"?')) {
                        console.log('Deleting table...')
                        $scope.currentClass.deleteRecord();
                        $scope.currentClass = null;
                        $scope.viewType = 'seating';
                    };
                };
                $scope.changeSeatDim = function(dimension, delta) {
                    var currNumCol = $scope.seats[0].length;
                    var currNumRow = $scope.seats.length;
                    var newNumRow = currNumRow;
                    var newNumCol = currNumCol;
                    if (dimension === 0) {
                        // remove a row
                        if (delta === -1 && currNumRow > 1){
                            var allEmpty = true;
                            // check if safe to remove row
                            for (var col=0; col<currNumCol; col++) {
                                if ($scope.seats[currNumRow-1][col].student !== false){
                                    allEmpty = false;
                                };
                            };
                            if (allEmpty){
                                $scope.seats.pop()
                                newNumRow--;
                            }
                        }
                        // add a row
                        else if (delta === 1 && currNumRow < 49){
                            $scope.seats.push([]);
                            for (var col=0; col<currNumCol; col++) {
                                $scope.seats[currNumRow].push({
                                    student: false,
                                    position: [currNumRow, col]
                                });
                            };
                            newNumRow++;
                        };
                    }
                    else if (dimension === 1) {
                        // remove a column
                        if (delta === -1 && currNumCol > 1)
                            var allEmpty = true;
                            // check if safe to remove col
                            for (var row=0; row<currNumRow; row++) {
                                if ($scope.seats[row][currNumCol-1].student !== false){
                                    allEmpty = false;
                                };
                            };
                            if (allEmpty){
                                for (var row=0; row<currNumRow; row++) {
                                    $scope.seats[row].pop();
                                };
                                newNumCol--;
                            }
                        // add a column
                        else if (delta === 1 && currNumCol < 9){
                            for (var row=0; row<currNumRow; row++) {
                                $scope.seats[row].push({
                                    student: false,
                                    position: [row, currNumCol]
                                });
                            };
                            newNumCol++;
                        };
                    };
                };
            }
        };
    })
