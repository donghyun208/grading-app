// js/controllers.js
angular.module('gradeControllers', [])
    .controller('MainCtrl', function($scope, $filter, dropstoreClient) {
        $scope.viewType = 'seating';

        $scope.connectToDropbox = function(){
            $scope.classDict = {};       // uses name of assignment as key
            $scope.assignmentDict = {}; 
            $scope.dropstoreService = dropstoreClient.create({key: '8rgn4aadulsnccd'});
            $scope.dropstoreService 
                .authenticate({interactive: true})
                .then(function(datastoreManager) {
                    console.log('completed authentication');
                    return datastoreManager.openDefaultDatastore();
                })
                .then(function(datastore) {
                    // all initaliziation goes in here!
                    // datastore.getTable('scores').get('_17iph79l6s0_js_yiU96').deleteRecord();
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
                    $scope.processRecurringAssignments();
                    $scope.initalized = true;
                });
        };

        $scope.processRecurringAssignments = function() {
            for(var i in $scope.assignmentList) {
                var assignment = $scope.assignmentList[i];
                if (assignment.get('recurring')) {

                    
                }
            }

        };

        $scope.debug = function(arg) {
            console.log(arg)
        };

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

        $scope.exportDropbox = function() {
            var matrix = [];
            var first_row = ["class", "first name", "last name", "locker ID"];
            var assignmentList = [];
            matrix.push(first_row)

            // add all assignment names to the first row:
            $scope.assignmentList.forEach(function(assignmentRec) {
                first_row.push(assignmentRec.get('name'));
            });

            $scope.classList.forEach(function(classRec) {
                var className = classRec.get('name');
                $scope.studentList.forEach(function(studentRec) {
                    if (studentRec.get('className') === className) {
                        var row = [
                            className,
                            studentRec.get('firstName'),
                            studentRec.get('lastName'),
                            studentRec.get('num')
                        ];
                        matrix.push(row);
                        $scope.assignmentList.forEach(function(assignmentRec) {
                            var assignID = assignmentRec.getId();
                            grade = studentRec.get(assignID);
                            if (grade === null) {
                                grade = "";
                            }
                            row.push(grade);
                        });
                    };
                });
            });

            output = ""
            for (var i=0; i<matrix.length; i++) {
                for (var j=0; j<matrix[0].length; j++){
                    output += matrix[i][j] + ','
                }
                output += '\n'
            }

            $scope.dropstoreService
                ._client.writeFile('gradebook_export.csv', output, function(err) {
                    if (err) {
                        alert('Error: ' + err);
                    }
                });
        };

        $scope.randomPick = function() {
            $scope.randomArray = [];
            $scope.currentStudents.forEach(function(student) {
                var name = student.get('firstName') + ' ' + student.get('lastName');
                $scope.randomArray.push(name);
            });
            shuffle($scope.randomArray);
        };

        $scope.initalizeDate()
        $scope.connectToDropbox();

    });


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

function shuffle(array) {

    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
