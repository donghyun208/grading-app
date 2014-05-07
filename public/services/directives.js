// js/directives.js
angular.module('gradeDirectives', ['ui.bootstrap', 'students'])

.directive('gradeButtons', function() {
  return {
    restrict: 'E',
    templateUrl: 'gradeButtons.html',
    link: function(scope){
      scope.enterGrade = function(grade) {
        scope.seat.grade = grade;
        var assignID = scope.current.assignment.getId();
        var student = scope.seat.student;
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
    controller: 'StudentsCtrl',
    link: function(scope) {
      scope.deleteClass = function() {
        if (confirm('Delete class "' + scope.current.classroom.get('name') + '"?')) {
          console.log('Deleting table...')
          scope.current.classroom.deleteRecord();
          scope.current.classroom = null;
          scope.current.students = null;
          scope.current.seats = null;
          scope.current.viewType = 'seating';
        };
      };
      scope.changeSeatDim = function(dimension, delta) {
        var currNumCol = scope.current.seats[0].length;
        var currNumRow = scope.current.seats.length;
        var newNumRow = currNumRow;
        var newNumCol = currNumCol;
        if (dimension === 0) {
          // remove a row
          if (delta === -1 && currNumRow > 1){
            var allEmpty = true;
            // check if safe to remove row
            for (var col=0; col<currNumCol; col++) {
              if (scope.current.seats[currNumRow-1][col].student !== false){
                allEmpty = false;
              };
            };
            if (allEmpty){
              scope.current.seats.pop()
              newNumRow--;
            }
          }
          // add a row
          else if (delta === 1 && currNumRow < 49){
            scope.current.seats.push([]);
            for (var col=0; col<currNumCol; col++) {
              scope.current.seats[currNumRow].push({
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
              if (scope.current.seats[row][currNumCol-1].student !== false){
                allEmpty = false;
              };
            };
            if (allEmpty){
              for (var row=0; row<currNumRow; row++) {
                scope.current.seats[row].pop();
              };
              newNumCol--;
            }
          // add a column
          else if (delta === 1 && currNumCol < 9){
            for (var row=0; row<currNumRow; row++) {
              scope.current.seats[row].push({
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