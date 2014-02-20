// js/controllers.js
angular.module('gradeControllers', [])
    .controller('MainCtrl', function($scope, $filter, Dropbox) {
        $scope.seats = [];
        $scope.assignType = 'prelab';
        $scope.viewType = 'seating';
        // $scope.currentAssignmentHolder = {assign: false};


        $scope.initalizeDate = function() {
            var offsetDict = {
                'Sun': 1,
                'Mon': 0,
                'Tue': -1,
                'Wed': -2,
                'Thu': -3,
                'Fri': -4,
                'Sat': -5
            }
            var dateObj = new Date();
            var dayWeek = $filter('date')(dateObj, "EEE")
            var startOffset = offsetDict[dayWeek];
            var endOffset = 4 + startOffset;
            startDateObj = new Date();
            startDateObj.setDate(startDateObj.getDate() + startOffset);
            endDateObj = new Date();
            endDateObj.setDate(endDateObj.getDate() + endOffset);

            $scope.startDateStr = $filter('date')(startDateObj, "M/d")
            $scope.endDateStr = $filter('date')(endDateObj, "M/d")
        };

        $scope.initalizeFromDropbox = function(){
            $scope.classDict = {};       // uses name of assignment as key
            $scope.assignmentDict = {}; 
            Dropbox.getDatastore(function(dstore) {

                var scoreTable = dstore.getTable("scores");
                var infoTable = dstore.getTable("info");
                var settingsRecord = infoTable.get("settings");

                // setDropboxDefaults(infoTable, scoreTable);
                if (settingsRecord == null) {
                    setDropboxDefaults(infoTable, scoreTable);
                }
                else {
                    var classList = infoTable.query({"isClass": true});
                    // Populate classDict with the class names
                    for (var i=0; i<classList.length; i++) {
                        $scope.classDict[classList[i].get("name")] = {};
                    }
                };

                // Populate each class in classDict with the corresponding students
                var allStudents = dstore.getTable("students").query({});
                for (var i=0; i<allStudents.length; i++) {
                    var position = [allStudents[i].get('pos').get(0), allStudents[i].get('pos').get(1)];
                    var className = allStudents[i].get('className');
                    var dropboxID = allStudents[i].getId();
                    var student = {
                        firstName: allStudents[i].get('firstName'),
                        lastName:  allStudents[i].get('lastName'),
                        num:       allStudents[i].get('num'),
                        pos:       position,
                        dropboxID: dropboxID
                    };
                    $scope.classDict[className][dropboxID] = student;
                };

                // Populate assignmentDict with assignemnts
                // $scope.assignmentTypes = {dropboxID: AssignmentType} <-- from infoTable}

                // AssignmentType = {
                //      recurring:      bool
                //      name:           String
                //      assignments: {dropboxID: Assignment}  <-- from scoreTable

                // Assignment = {
                //      name:             String   
                //      date:             dateString
                //      studentDropboxID: score
                // }
                $scope.assignmentTypes = {};

                var assignmentInfoList = infoTable.query({isAssignment: true});
                // for (var i=0; i<assignmentInfoList.length; i++) {
                //     var assignmentTypeFields = assignmentInfoList[i].getFields();
                //     delete assignmentTypeFields["isAssignment"];
                //     $scope.assignmentTypes[infoRecord.getId()] = assignmentTypeFields;
                // }
                // var assignmentQueryList = scoreTable.query({});

                for (var i=0; i<assignmentInfoList.length; i++) {
                    var assignment = $scope.processAssignment(assignmentInfoList[i], scoreTable);
                    $scope.assignmentDict[assignment.dropboxID] = assignment;
                };
                // for (var i=0; i<assignmentQueryList.length; i++) {
                //     var assignment = assignmentQueryList[i].getFields();
                //     assignment.dropboxID = assignmentQueryList[i].getId();
                //     $scope.assignmentDict[assignment.dropboxID] = assignment;
                // };
                $scope.initalized = true;
                $scope.$apply();
            });
        };

        $scope.processAssignment = function(assignmentRecord, scoreTable) {
            var assignment = assignmentRecord.getFields();
            if (assignment['recurring']) {
                var name = $scope.startDateStr + ' - ' + $scope.endDateStr + ' ' + assignment['name'];
                assignment['name'] = name;
            }
            scoreQuery = scoreTable.query({name: name});
            if (scoreQuery.length > 0){
                $.extend(assignment, scoreQuery[0].getFields());
            }
            else {
                scoreTable.insert
            }
            assignment.dropboxID = assignmentRecord.getId();
            return assignment;
        };

        $scope.deleteClass = function() {
            if (confirm('Delete class "' + $scope.currentClass + '"?')) {
                console.log('Deleting table...')
                Dropbox.getDatastore(function(dstore) {
                    var records = dstore.getTable('students').query({"className": $scope.currentClass});
                    for (var i=0; i<records.length; i++) {
                        records[i].deleteRecord();
                    };
                    console.log('Deleted all records from table!')
                    delete $scope.classDict[$scope.currentClass];
                    $scope.currentClass = null;
                    $scope.$apply();
                });
            };
        };

        $scope.setCurrentClass = function(className) {
            $scope.studentDict = $scope.classDict[className];
            var row_list = [];
            var col_list = [];
            for (var dropboxID in $scope.studentDict) {
                if ($scope.studentDict.hasOwnProperty(dropboxID)) {
                    var student = $scope.studentDict[dropboxID];
                    row_list.push(student.pos[0]);
                    col_list.push(student.pos[1]);
                };
            };

            if (row_list.length == 0) {
                var row_max = 8;
                var col_max = 4;
            }
            else {
                var row_max = Math.max.apply(Math, row_list) + 1;
                var col_max = Math.max.apply(Math, col_list) + 1;
            }

            // create the seating matrix
            $scope.seats = [];
            for (var row=0; row<row_max; row++) {
                $scope.seats.push([])
                for (var col=0; col<col_max; col++) {
                    $scope.seats[row].push([false, row, col]);
                };
            };

            // populate $scope.seats
            for (var dropboxID in $scope.studentDict) {
                if ($scope.studentDict.hasOwnProperty(dropboxID)) {
                    var student = $scope.studentDict[dropboxID];
                    $scope.seats[student.pos[0]][student.pos[1]][0] = student;
                };
            };
            $scope.currentClass = className;
            $scope.viewType = 'seating';
        };

        $scope.changeSeatDim = function(dimension, delta) {
            var currNumCol = $scope.seats[0].length;
            var currNumRow = $scope.seats.length;
            var newNumRow = currNumRow;
            var newNumCol = currNumCol;
            if (dimension == 0) {
                // remove a row
                if (delta == -1 && currNumRow > 1){
                    var allEmpty = true;
                    // check if safe to remove row
                    for (var col=0; col<currNumCol; col++) {
                        if ($scope.seats[currNumRow-1][col][0] != false){
                            allEmpty = false;
                        };
                    };
                    if (allEmpty){
                        $scope.seats.pop()
                        newNumRow--;
                    }
                }
                // add a row
                else if (delta == 1 && currNumRow < 49){
                    $scope.seats.push([]);
                    for (var col=0; col<currNumCol; col++) {
                        $scope.seats[currNumRow].push([false, currNumRow, col]);
                    };
                    newNumRow++;
                };
            }
            else if (dimension == 1) {
                // remove a column
                if (delta == -1 && currNumCol > 1)
                    var allEmpty = true;
                    // check if safe to remove col
                    for (var row=0; row<currNumRow; row++) {
                        if ($scope.seats[row][currNumCol-1][0] != false){
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
                else if (delta == 1 && currNumCol < 9){
                    for (var row=0; row<currNumRow; row++) {
                        $scope.seats[row].push([false, row, currNumCol]);
                    };
                    newNumCol++;
                };
            };
        };

        $scope.setRowColforStudent = function(row, col) {
            $scope.currRow = row;
            $scope.currCol = col;
        };

        $scope.setSelectedStudent = function(student) {
            $scope.currRow = student.pos[0];
            $scope.currCol = student.pos[1];
            $scope.currStudent = student;
            $scope.studentFirstName = student.firstName;
            $scope.studentLastName = student.lastName;
            $scope.studentNum = student.num;
        };

        $scope.debug = function(arg) {
            console.log(arg)
        };

        $scope.setAssignment = function(assignment) {
            for (var dropboxID in $scope.studentDict) {
                if ($scope.studentDict.hasOwnProperty(dropboxID)) {
                    var student = $scope.studentDict[dropboxID];
                    student.score = assignment[dropboxID];
                };
            };
            $scope.currentAssignment = assignment;
            // $scope.currentAssignmentHolder.assign = assignment;
        };

        $scope.exportDropbox = function() {
            var matrix = [];
            var first_row = ["class", "first name", "last name", "locker ID"];
            var assignmentList = [];
            matrix.push(first_row)
            for (var dropboxID in $scope.assignmentDict)
                if (dropboxID != $scope.assignmentDict.hasOwnProperty(dropboxID)) {
                    first_row.push($scope.assignmentDict[dropboxID]["name"]);
                    assignmentList.push($scope.assignmentDict[dropboxID]);
                }

            for (var className in $scope.classDict) {
                if ($scope.classDict.hasOwnProperty(className)) {
                    var studentDict = $scope.classDict[className];
                    for (var dropboxID in studentDict)
                        if (studentDict.hasOwnProperty(dropboxID)) {
                            var student = studentDict[dropboxID];
                            var row = [className, student.firstName, student.lastName, student.num];
                            matrix.push(row);

                            for (var k=0; k<assignmentList.length; k++) {
                                if (dropboxID in assignmentList[k])
                                    score = assignmentList[k][dropboxID];
                                else
                                    score = "";
                                row.push(score);
                            };
                            $scope.classDict[className][dropboxID] = student;
                        };
                };
            }
            output = ""
            for (var i=0; i<matrix.length; i++) {
                for (var j=0; j<matrix[0].length; j++){
                    output += matrix[i][j] + ','
                }
                output += '\n'
            }

            Dropbox.client(function(client) {
                client.writeFile('gradebook_export.csv', output, function(err) {
                    if (err) {
                        alert('Error: ' + err);
                    }
                });
            });
        };
        $scope.initalizeDate()
        $scope.initalizeFromDropbox();
    })

var randomPick = function() {

};

var setDropboxDefaults = function(infoTable, scoreTable) {
    // initalize
    infoTable.getOrInsert("settings",
    {
        "initalized": true
    });

    infoTable.insert({
        "name":         "prelab",
        "isAssignment": true,
        "recurring":    true
    });
    infoTable.insert({
        "name":      "checkout",
        "isAssignment": true,
        "recurring": true
    });
    // set default assignment list
    // scoreTable.insert({
    //     "name": "prelab"
    // })
    // scoreTable.insert({
    //     "name": "checkout"
    // })
};