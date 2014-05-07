// controllers/ClassesCtrl.js
angular.module('classes', ['ui.bootstrap'])
  .controller('ClassesCtrl', function($scope, $modal) {

    var ModalInstanceCtrl = function($scope, $modalInstance) {

      $scope.ok = function(data) {
        $modalInstance.close(data);
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }

    $scope.openAddClassModal = function() {

      var modalInstance = $modal.open({
        templateUrl: 'addClassModal.html',
        controller: ModalInstanceCtrl,
      })


      // When "Add Class" is clicked:
      modalInstance.result.then(function(classData) {
        var repeatedName = false;
        $scope.classList.forEach(function(classRec) {
          if (classRec.get('name') === classData.name) {
            repeatedName = true;
          };
        })
        if (!repeatedName) {
          classTable = $scope._datastore.getTable("classes"); 
          var newClass = classTable.insert({
              name: classData.name
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
      });
    }

    $scope.setCurrentClass = function(classRec) {
      $scope.current.classroom = classRec;
      var className = classRec.get('name');
      $scope.current.viewType = 'seating';
      createSeatingMatrix(className)
    };

    var createSeatingMatrix = function(className) {
      var row_list = [];
      var col_list = [];
      $scope.current.students = [];
      $scope.studentList.forEach(function(studentRec) {
        if (studentRec.get('className') === className) {
          $scope.current.students.push(studentRec);
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
      $scope.current.seats = [];
      for (var row=0; row<row_max; row++) {
        $scope.current.seats.push([])
        for (var col=0; col<col_max; col++) {
          $scope.current.seats[row].push({
            student: false,
            grade: null,
            position: [row, col]
          });
        };
      };

      // populate the seating matrix
      $scope.current.students.forEach(function(studentRec) {
        var row = studentRec.get('pos').get(0);
        var col = studentRec.get('pos').get(1);
        $scope.current.seats[row][col].student = studentRec;
      });
    }
  })


