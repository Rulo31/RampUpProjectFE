(function () {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .controller('MakeReservationController', MakeReservationController);

  /** @ngInject */
  function MakeReservationController(WizardHandler, UserFactory, ReservationFactory, BranchFactory, FieldFactory, $uibModal, $location, $scope, toastr, $filter) {
    var vm = this;
    var modalInstance;
    vm.openModal = openModal;
    vm.switchMode = switchMode;
    vm.okModal = okModal;
    vm.dismissModal = dismissModal;
    vm.selectedTime = null;
    vm.selectTime = selectTime;
    vm.selectField = selectField;
    vm.selectDate = selectDate;
    vm.finishedWizard = finishedWizard;
    vm.card = {};
    vm.proceedWithPayment = proceedWithPayment;
    vm.datePicketOptions = {
      minDate: new Date()
    }
    
    vm.timeSlots = {
      morningTimeSlots: [
        { startTime: '07:00', endTime: '08:00', value: '07:00 - 08:00', status: 'A' },
        { startTime: '08:00', endTime: '09:00', value: '08:00 - 09:00', status: 'A' },
        { startTime: '09:00', endTime: '10:00', value: '09:00 - 10:00', status: 'A' },
        { startTime: '10:00', endTime: '11:00', value: '10:00 - 11:00', status: 'A' },
        { startTime: '11:00', endTime: '12:00', value: '11:00 - 12:00', status: 'A' }
      ],
      afternoonTimeSlots: [
        { startTime: '12:00', endTime: '13:00', value: '12:00 - 13:00', status: 'A' },
        { startTime: '13:00', endTime: '14:00', value: '13:00 - 14:00', status: 'A' },
        { startTime: '14:00', endTime: '15:00', value: '14:00 - 15:00', status: 'A' },
        { startTime: '15:00', endTime: '16:00', value: '15:00 - 16:00', status: 'A' },
        { startTime: '16:00', endTime: '17:00', value: '16:00 - 17:00', status: 'A' }
      ],
      eveningTimeSlots: [
        { startTime: '17:00', endTime: '18:00', value: '17:00 - 18:00', status: 'A' },
        { startTime: '18:00', endTime: '19:00', value: '18:00 - 19:00', status: 'A' },
        { startTime: '19:00', endTime: '20:00', value: '19:00 - 20:00', status: 'A' },
        { startTime: '20:00', endTime: '21:00', value: '20:00 - 21:00', status: 'A' },
        { startTime: '21:00', endTime: '22:00', value: '21:00 - 22:00', status: 'A' },
        { startTime: '22:00', endTime: '23:00', value: '22:00 - 23:00', status: 'A' },
        { startTime: '23:00', endTime: '00:00', value: '23:00 - 00:00', status: 'A' }
      ]
    }

    init();

    function init() {
      vm.isLoading = true;
      vm.user = UserFactory.GetCurrentUser();

      FieldFactory.GetAllFields().then(
        function(response) {
          vm.fields = response.data;
          vm.isLoading = false;
        },
        function () {
          showToastr('error', 'Error getting fields from database.', 'Error');
          vm.isLoading = false;
        }
      );
    }

    function selectField(field) {
      vm.selectedField = field;
      WizardHandler.wizard().next();
    }

    function selectTime(time) {
      if (time.status != 'A') {
        showToastr('error', 'This time slot is already reserved.', 'Time slot not available');
      } else {
        vm.selectedTime = time;
        WizardHandler.wizard().next();
      }
    }

    function selectDate(selectedDate) {
      if (angular.isDefined(selectedDate)) {
        vm.selectedDate = selectedDate;
        WizardHandler.wizard().next();
      }

      getReservationsPerDay();
    }

    function finishedWizard() {
      $location.url('/Reservation/MyReservations');
    }

    function getReservationsPerDay() {
      vm.isLoading = true;
      var parsedDate = $filter('date')(vm.selectedDate, "MM-dd-yyyy");

      ReservationFactory.GetReservationsPerDay(parsedDate, vm.selectedField.Field_Id).then(
        function (response) {
          parseReservationsToTimeSlots(response.data);
        },
        function () {
          vm.isLoading = false;
        }
      );
    }

    function parseReservationsToTimeSlots(reservationsPerDay) {
      var busyTimeSlot = null;

      for (var i = 0; i < reservationsPerDay.length; i++) {

        var startTime = reservationsPerDay[i].Start_Time.substring(0, reservationsPerDay[i].Start_Time.length-3); 
        var endTime = reservationsPerDay[i].End_Time.substring(0, reservationsPerDay[i].End_Time.length-3);

        var morningTimeSlot = $filter('filter')(vm.timeSlots.morningTimeSlots, { startTime: startTime, endTime: endTime });
        
        if (morningTimeSlot.length > 0) {
          busyTimeSlot = morningTimeSlot[0];
          var index = vm.timeSlots.morningTimeSlots.indexOf(busyTimeSlot);
          busyTimeSlot.status = 'N';
          vm.timeSlots.morningTimeSlots[index] = busyTimeSlot;
        } else {
          var afternoonTimeSlot = $filter('filter')(vm.timeSlots.afternoonTimeSlots, { startTime: startTime, endTime: endTime });

          if (afternoonTimeSlot.length > 0) {
            busyTimeSlot = afternoonTimeSlot[0];
            index = vm.timeSlots.afternoonTimeSlots.indexOf(busyTimeSlot);
            busyTimeSlot.status = 'N';
            vm.timeSlots.afternoonTimeSlots[index] = busyTimeSlot;
          } else {
            var eveningTimeSlot = $filter('filter')(vm.timeSlots.eveningTimeSlots, { startTime: startTime, endTime: endTime });

            if (eveningTimeSlot.length > 0) {
              busyTimeSlot = eveningTimeSlot[0];
              index = vm.timeSlots.eveningTimeSlots.indexOf(busyTimeSlot);
              busyTimeSlot.status = 'N';
              vm.timeSlots.eveningTimeSlots[index] = busyTimeSlot;
            }
          }
        }
      }

      vm.isLoading = false;
    }

    function proceedWithPayment(PaymentForm) {
      vm.submitted = true;

      if (PaymentForm.$valid) {
        vm.isLoading = true;

        // Proceed with Payment with NODE
        vm.successPayment = true;
        vm.paymentConfirmationID = 'ABC123456';

        WizardHandler.wizard().next();

        if (vm.successPayment) {
          addReservation();
        } else {
          vm.isLoading = false;
          showToastr('error', 'Unable to process payment.', 'Error');
        }
      }
    }

    function addReservation() {
      vm.reservation = {
        User_Id: vm.user.User_Id,
        Date: vm.selectedDate,
        Start_Time: vm.selectedTime.startTime,
        End_Time: vm.selectedTime.endTime,
        Field_Id: vm.selectedField.Field_Id,
        Creation_Date: new Date()
      }

      ReservationFactory.AddReservation(vm.reservation).then(
        function(response) {
          vm.reservation.Reservation_Id = response.data;
          vm.isLoading = false;
        },
        function() {
          vm.isLoading = false;
          showToastr('error', 'Unable to book your resevation.', 'Error');
        }
      );
    }

    function okModal() {
      modalInstance.close();
    }

    function dismissModal() {
      modalInstance.dismiss();
    }

    function switchMode(mode) {
      vm.mode = mode;
      UserFactory.SetCurrentMakeUserMode(mode);

      if (vm.mode == 'V') {
        vm.action = 'Reservation Information';
      } else if (vm.mode == 'C') {
        vm.user = {};
        vm.user.Address = {};
        vm.user.Phones = [];
        vm.action = 'Create New Reservation';
      } else if (vm.mode == 'U') {
        vm.action = 'Update Reservation';
      } else {
        vm.action = 'Reservation Information';
      }
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

    vm.isVisa = function(){
      if (vm.card.number && vm.card.number.charAt(0) == 4) {
        return true;
      } else {
        return false;
      }
    };

    vm.isMasterCard = function(){
      if(vm.card.number && vm.card.number.charAt(0) == 5){
        return true;
      }else{
        return false;
      }
    };

    
  }
})();
