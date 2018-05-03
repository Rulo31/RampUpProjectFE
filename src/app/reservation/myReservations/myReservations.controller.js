(function() {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .controller('MyReservationsController', MyReservationsController);

  /** @ngInject */
  function MyReservationsController(UserFactory, ReservationFactory, BranchFactory, $uibModal, $scope, toastr, $filter, $location) {
    var vm = this;
    var modalInstance;
    vm.openModal = openModal;
    vm.switchToManageReservation = switchToManageReservation;
    vm.removeReservation = removeReservation;
    vm.okModal = okModal;
    vm.dismissModal = dismissModal;

    init();

    function init() {      
      vm.isLoading = true;
      vm.user = UserFactory.GetCurrentUser();

      ReservationFactory.GetMyReservations(vm.user.User_Id).then(
        function(response) {
          vm.reservations = response.data;
          vm.isLoading = false;
        },
        function() {
          showToastr('error', 'Unable to retrieve your reservations from DB.', 'Error');
          vm.isLoading = false;
        }
      );
    }

    function switchToManageReservation(reservation, mode) {
      vm.isLoading = true;

      BranchFactory.GetBranchesByReservationId(reservation.Reservation_Id).then(
        function(response) {
          reservation.Branches = response.data;
          ReservationFactory.SaveCurrentReservation(reservation);
          ReservationFactory.SetCurrentManageReservationMode(mode);
          $location.url('/Reservation/ManageReservation');
        },
        function() {
          showToastr('error', 'Unable to retrieve branches from DB.', 'Error');
        }
      )
    }

    function openModal(templateUrl, size) {
      modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: templateUrl,
        scope: $scope,
        size: size,
        keyboard: false,
        backdrop: 'static'
      });
    }

    function removeReservation (array, index) {
			openModal('deleteModal', 'md');
			modalInstance.result.then(
				function () {
					ReservationFactory.RemoveReservation(array[index].Reservation_Id).then(
						function () {
              array.splice(index, 1);
              
              if (array.length == 0) {
                vm.noElementsFound = true;
              }
						},
						function () {
							formatError('Something went wrong.', 'Error removing branch in database.');
						}
					);
				}
			);
    }
    
    function formatError(title, description) {
      vm.errorTitle = title;
      vm.errorDescription = description;
      vm.isLoading = false;
      vm.error = true;
    }

    function okModal() {
      modalInstance.close();
    }

		function dismissModal () {
			modalInstance.dismiss();
		}

    function showToastr(type, message, title) {
      if (type.toLowerCase() == 'info') {
        toastr.info(message, title);
      } else if (type.toLowerCase() == 'error') {
        toastr.error(message, title);
      } else if (type.toLowerCase() == 'success') {
        toastr.success(message, title);
      } else if (type.toLowerCase() == 'warning') {
        toastr.warning(message, title);
      } else {
        toastr.info(message, title);
      }
    }
  }
})();
