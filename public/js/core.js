// Angular module, defining routes for the app
angular.module('grade', [])
    .controller('gradeController', function($scope) {
        $scope.seats = [];
        $scope.assignType = 'prelab';

        for (var row=0; row<9; row++) {
            $scope.seats.push([])
            for (var col=0; col<4; col++) {
                $scope.seats[row].push([false, row, col]);
            }
        }

        $scope.enterScore = function(student, score){
            student.score = score;
            console.log(student.name, "score of: ", student.score)

        };

        $scope.clearScores = function(){};
            for (var student in $scope.students) {
                students.score = false;
            };

        $scope.submitScores = function(){
            //implement this
            window.alert('not implemented yet!');
        };

        $scope.setclass = function(classID){

            if (classID == 0) {
                $scope.students = am_class;
            }
            else if (classID == 1) {
                $scope.students = pm_class;
            };
            update_class($scope);
        };


    });

var update_class = function($scope) {
    for (var row=0; row<$scope.seats.length; row++) {
        for (var col=0; col<$scope.seats[0].length; col++) {
            $scope.seats[row][col][0] = false;
        }
    };
    for (var i=0; i<$scope.students.length; i++) {
        var row = $scope.students[i].pos[0];
        var col = $scope.students[i].pos[1];
        $scope.seats[row][col][0] = $scope.students[i];
    };
};