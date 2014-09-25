// controllers/AssignmentsCtrl.js
angular.module('assignments', ['ui.bootstrap'])
  .controller('AssignmentsCtrl', function($scope, $modal) {

    var ModalInstanceCtrl = function($scope, $modalInstance) {
      $scope.ok = function(data) {
        $modalInstance.close(data)
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel')
      }
    }

    var checkRepeatedName = function(assignName, callback) {
      var repeatedName = false;
      var compareName = assignName.toLowerCase()
      $scope.assignmentList.forEach(function(assignRec) {
        console.log(assignRec.get('name').toLowerCase(), compareName)
        if (assignRec.get('name').toLowerCase() === compareName) {
          repeatedName = true;
        };
      })

      if (repeatedName) {
        $(".temporary-alerts").html(
    "<div id='dupeAssignmentWarning' class='alert alert-info fade in'><button type='button' class='close' data-dismiss='alert' aria-hidden='true'> &times; </button>  <div class='text-center'> <strong> Assignment with that name already exists</strong> </div> </div>")
        setTimeout(function() {
          $("#dupeAssignmentWarning").fadeOut('slow', function() {$(".temporary-alerts").empty()});
          }, 2000);
      }
      else
        callback()
    }

    $scope.addAssignmentModal = function() {
      var modalInstance = $modal.open({
        templateUrl: 'addAssignmentModal.html',
        controller: ModalInstanceCtrl
      })

      // When "Add Assignment" is clicked:
      modalInstance.result.then(function(assignmentData) {
        var assignName = assignmentData.name.trim()
        if (assignName.length > 0) {
          console.log(assignName)
          checkRepeatedName(assignName, function() {
            var newAssignment = $scope._datastore.getTable("assignments").insert({
              "name": assignName,
              "manual": assignmentData.manualScores ? true : false,
            });
            $scope.setCurrentAssignment(newAssignment);
          })
        }
      })
    }

    var ModalEditInstanceCtrl = function($scope, $modalInstance, assignment) {
      $scope.assignment = assignment;


      $scope.edit = function(data) {
        data.deleteItem = false;
        $modalInstance.close(data);
      }

      $scope.delete = function(data) {
        data.deleteItem = true;
        $modalInstance.close(data);
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      }
    }

    $scope.editAssignmentModal = function() {
      var modalInstance = $modal.open({
        templateUrl: 'editAssignmentModal.html',
        controller: ModalEditInstanceCtrl,
        resolve: {
          assignment: function() { return {
            name: $scope.current.assignment.get('name'),
            manualScores: $scope.current.assignment.get('manual'),
          } }
        }
      })

      // When "Edit Assignment" is clicked:
      modalInstance.result.then(function(data) {
        if (data.deleteItem === true) {
          console.log('deleting assignment')
          var assignID = $scope.current.assignment.getId();
          $scope.studentList.forEach(function(studentRec) {
            studentRec.set(assignID, null)
          });
          $scope.current.assignment.deleteRecord();
          $scope.current.assignment = null;
        }
        else {
          var newName = data.name.trim()
          if (newName.length > 0 && newName !== $scope.current.assignment.get("name")) {
            checkRepeatedName(newName, function() {
              $scope.current.assignment.set("name", newName);
            })
          }
          if ($scope.current.assignment.get("manual") !== data.manualScores) {
            $scope.current.assignment.set("manual", data.manualScores);
          }
          $scope.setCurrentAssignment($scope.current.assignment);
        }
      })
    }

    $scope.setCurrentAssignment = function(assignment) {
      console.log('setting the assignment')
      $scope.current.assignment = assignment;
      $scope.current.manualScores = assignment.get('manual');
      var assignID = assignment.getId();
      $scope.current.seats.forEach(function(row) {
        row.forEach(function(seat) {
          if (seat.student !== false) {
            seat.grade = seat.student.get(assignID);
          }
        })
      })
    }
  })