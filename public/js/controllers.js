// js/controllers.js
angular.module('gradeControllers', [])
    .controller('MainCtrl', function($scope, $filter, dropstoreClient) {
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
            dropstoreClient.create({key: '8rgn4aadulsnccd'})
                .authenticate({interactive: true})
                .then(function(datastoreManager) {
                    console.log('completed authentication');
                    return datastoreManager.openDefaultDatastore();
                })
                .then(function(datastore) {
                    // all initaliziation goes in here!
                    // datastore.getTable('students').get('_17jd54p82i8_js_hPOSL').deleteRecord();
                    console.log('completed openDefaultDatastore!!!!');
                    datastore.SubscribeRecordsChanged(function(records) {
                        for (var ndx in records) {
                            var record = records[ndx];
                            console.log(record);

                            if (record.isDeleted()) {
                                // remove deleted student from list
                                for (var s_ndx in $scope.studentList) {
                                    var curr_record = $scope.studentList[s_ndx];
                                    if (curr_record.getId() === record.getId()) {
                                        $scope.studentList.splice($scope.studentList.indexOf(curr_record), 1);
                                        break;
                                    }
                                }
                            }
                            else {
                                //record is new or updated.
                                var found = false;
                                for (var s_ndx in $scope.studentList) {
                                    var curr_record = $scope.studentList[s_ndx];
                                    if (curr_record.getId() === record.getId()) {
                                        $scope.studentList[$scope.studentList.indexOf(curr_record)] = record;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    $scope.studentList.push(records[ndx]);
                                }
                            };
                        };
                    }, 'students');
                    datastore.SubscribeRecordsChanged(function(records) {
                        for (var ndx in records) {
                            var record = records[ndx];
                            console.log(record);
                            if (record.isDeleted()) {
                                // remove deleted assignment from list
                                for (var s_ndx in $scope.assignmentList) {
                                    var curr_record = $scope.assignmentList[s_ndx];
                                    if (curr_record.getId() === record.getId()) {
                                        $scope.assignmentList.splice($scope.assignmentList.indexOf(curr_record), 1);
                                        break;
                                    }
                                }
                            }
                            else {
                                //record is new or updated.
                                var found = false;
                                for (var s_ndx in $scope.assignmentList) {
                                    var curr_record = $scope.assignmentList[s_ndx];
                                    if (curr_record.getId() === record.getId()) {
                                        $scope.assignmentList[$scope.assignmentList.indexOf(curr_record)] = record;
                                        found = true;
                                        break;
                                    }
                                }
                                if(!found) {
                                    $scope.assignmentList.push(records[ndx]);
                                }
                            };
                        };
                    }, 'assignments');
                    datastore.SubscribeRecordsChanged(function(records) {
                        for (var ndx in records) {
                            var record = records[ndx];
                            if (record.isDeleted()) {
                                // remove deleted class from list
                                for (var s_ndx in $scope.classList) {
                                    var curr_record = $scope.classList[s_ndx];
                                    if (curr_record.getId() === record.getId()) {
                                        $scope.classList.splice($scope.classList.indexOf(curr_record), 1);
                                        break;
                                    }
                                }
                            }
                            else {
                                //record is new or updated.
                                var found = false;
                                for(var s_ndx in $scope.classList){
                                    var curr_record = $scope.classList[s_ndx];
                                    if(curr_record.getId() === record.getId()){
                                        $scope.classList[$scope.classList.indexOf(curr_record)] = record;
                                        found = true;
                                        break;
                                    }
                                }
                                if(!found){
                                    $scope.classList.push(records[ndx]);
                                }
                            };
                        };
                    }, 'classes');
                    $scope._datastore = datastore;
                    $scope.studentList = datastore.getTable('students').query();
                    $scope.assignmentList = datastore.getTable('assignments').query();
                    $scope.classList = datastore.getTable('classes').query();
                    $scope.initalized = true;
                });
            // Dropbox.getDatastore(function(dstore) {

            //     var scoreTable = dstore.getTable("scores");
            //     var infoTable = dstore.getTable("info");
            //     var settingsRecord = infoTable.get("settings");

            //     // setDropboxDefaults(infoTable, scoreTable);
            //     if (settingsRecord === null) {
            //         setDropboxDefaults(infoTable, scoreTable);
            //     }
            //     else {
            //         var classList = infoTable.query({"isClass": true});
            //         // Populate classDict with the class names
            //         for (var i=0; i<classList.length; i++) {
            //             $scope.classDict[classList[i].get("name")] = {};
            //         }
            //     };

            //     // Populate each class in classDict with the corresponding students
            //     var allStudents = dstore.getTable("students").query({});
            //     for (var i=0; i<allStudents.length; i++) {
            //         var position = [allStudents[i].get('pos').get(0), allStudents[i].get('pos').get(1)];
            //         var className = allStudents[i].get('className');
            //         var dropboxID = allStudents[i].getId();
            //         var student = {
            //             firstName: allStudents[i].get('firstName'),
            //             lastName:  allStudents[i].get('lastName'),
            //             num:       allStudents[i].get('num'),
            //             pos:       position,
            //             dropboxID: dropboxID
            //         };
            //         $scope.classDict[className][dropboxID] = student;
            //     };

            //     // Populate assignmentDict with assignemnts
            //     // $scope.assignmentTypes = {dropboxID: AssignmentType} <-- from infoTable}

            //     // AssignmentType = {
            //     //      recurring:      bool
            //     //      name:           String
            //     //      assignments: {dropboxID: Assignment}  <-- from scoreTable

            //     // Assignment = {
            //     //      name:             String   
            //     //      date:             dateString
            //     //      studentDropboxID: score
            //     // }
            //     $scope.assignmentTypes = {};

            //     var assignmentInfoList = infoTable.query({isAssignment: true});
            //     // for (var i=0; i<assignmentInfoList.length; i++) {
            //     //     var assignmentTypeFields = assignmentInfoList[i].getFields();
            //     //     delete assignmentTypeFields["isAssignment"];
            //     //     $scope.assignmentTypes[infoRecord.getId()] = assignmentTypeFields;
            //     // }
            //     // var assignmentQueryList = scoreTable.query({});

            //     for (var i=0; i<assignmentInfoList.length; i++) {
            //         var assignment = $scope.processAssignment(assignmentInfoList[i], scoreTable);
            //         $scope.assignmentDict[assignment.dropboxID] = assignment;
            //     };
            //     // for (var i=0; i<assignmentQueryList.length; i++) {
            //     //     var assignment = assignmentQueryList[i].getFields();
            //     //     assignment.dropboxID = assignmentQueryList[i].getId();
            //     //     $scope.assignmentDict[assignment.dropboxID] = assignment;
            //     // };
            //     $scope.initalized = true;
            //     $scope.$apply();
            // });
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
            if (confirm('Delete class "' + $scope.currentClass.get('name') + '"?')) {
                console.log('Deleting table...')
                $scope.currentClass.deleteRecord();
                $scope.currentClass = null;
                $scope.viewType = 'seating';
            };
        };

        $scope.setCurrentClass = function(classRec) {
            var className = classRec.get('name');
            var row_list = [];
            var col_list = [];
            $scope.currentClass = classRec;
            $scope.viewType = 'seating';
            $scope.students = [];
            $scope.studentList.forEach(function(studentRec) {
                if (studentRec.get('className') === className) {
                    $scope.students.push(studentRec);
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
                        position: [row, col]
                    });
                };
            };

            // populate the seating matrix
            $scope.students.forEach(function(studentRec) {
                var row = studentRec.get('pos').get(0);
                var col = studentRec.get('pos').get(1);
                $scope.seats[row][col].student = studentRec;
            });
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
                if (dropboxID !== $scope.assignmentDict.hasOwnProperty(dropboxID)) {
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
