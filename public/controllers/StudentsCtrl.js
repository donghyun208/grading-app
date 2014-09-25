// controllers/StudentsCtrl.js
angular.module('students', ['ui.bootstrap'])
  .controller('StudentsCtrl', function($scope, $modal) {

    var ModalInstanceCtrl = function($scope, $modalInstance, seat) {
      $scope.ok = function(data) {
        data.seat = seat
        $modalInstance.close(data)
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel')
      }
    }

    $scope.addStudentModal = function(seat) {
      $scope.currentSeat = seat

      var modalInstance = $modal.open({
        templateUrl: 'addStudentModal.html',
        controller:  ModalInstanceCtrl,
        resolve: {
          seat:      function() {return seat}
        }
      })


      // When "Add Student" is clicked:
      modalInstance.result.then(function(data) {
        var newStudent = $scope._datastore.getTable("students").insert({
          firstName: data.firstName,
          lastName:  data.lastName,
          num:       data.num || '',
          pos:       data.seat.position,
          className: $scope.current.classroom.get('name')
        })
        data.seat.student = newStudent
        $scope.current.students.push(newStudent)
      })
    }

    var ModalEditInstanceCtrl = function($scope, $modalInstance, seat, student) {
      $scope.seat = seat
      $scope.student = student

      $scope.edit = function(data) {
        data.seat = seat
        $modalInstance.close(data);
      }

      $scope.delete = function(data) {
        data.deleteItem = true;
        data.seat = seat
        $modalInstance.close(data);
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      }
    }

    $scope.editStudentModal = function(seat) {
      var modalInstance = $modal.open({
        templateUrl: 'editStudentModal.html',
        controller: ModalEditInstanceCtrl,
        resolve: {
        //   className: $scope.current.classroom.get('name'),
        //   current:   $scope.current,
          seat:      function() {return seat},
          student:   function() {
              return {
                firstName: seat.student.get('firstName'),
                lastName: seat.student.get('lastName'),
                num: seat.student.get('num')
              }
            }
        }
      })


      // When "Edit Assignment" is clicked:
      modalInstance.result.then(function(data) {
        if (data.deleteItem) {
          // for (var i=0; i<$scope.studentList.length; i++) {
          //   if ($scope.studentList[i] === data.seat.student)
          //     $scope.studentList[i] = false
          // }
          var tempStudent = data.seat.student
          data.seat.student = false
          tempStudent.deleteRecord();
        }
        else {
          data.seat.student.update({
            firstName: data.firstName,
            lastName:  data.lastName,
            num:       data.num,
            pos:       data.seat.position
          });
        }
      });
    }
  })