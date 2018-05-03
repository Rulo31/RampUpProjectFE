(function() {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .controller('ManageUserController', ManageUserController);

  /** @ngInject */
  function ManageUserController(UserFactory, AuditLogFactory, $location, $uibModal, $scope, toastr, $filter) {
    var vm = this;
    var auditLogs = [];
    var modalInstance;
    var userCopy = null;
    vm.action = 'Create New User';
    vm.submitUser = submitUser;
    vm.openModal = openModal;
    vm.closeModal = closeModal;
    vm.addPhoneNumber = addPhoneNumber;
    vm.removePhoneNumber = removePhoneNumber;
    vm.switchMode = switchMode;
    vm.tempPhoneNumber = {};
    vm.selectedPhoneType =  'Mobile';

    vm.phoneTypes = [
      'Mobile',
      'Work',
      'Home',
      'Business'
    ]

    init();

    function init() {
      UserFactory.GetCurrentManageUserMode().then(
        function(mode) {
          vm.mode = mode;
          vm.user = UserFactory.GetCurrentUser();

          if (vm.user == null) {
            switchMode('C');
          } else {
            switchMode('V');
          }
       }
      );
    }

    function submitUser(basicInfoForm, addressForm) {
      vm.submitted = true;

      if (basicInfoForm.$valid && addressForm.$valid && vm.user.Phones.length > 0) {
        vm.isLoading = true;
        if (vm.mode == 'C') {
          vm.user.status = 'Active';
          vm.user.creation_date = new Date();
          vm.user.Address.creation_date = new Date();

          UserFactory.IsUserRegistered(vm.user).then(
            function(response) {
              if (!response.data) {
                UserFactory.AddUser(vm.user).then(
                  function(response) {
                    showToastr('success', 'User added successfully.', 'Success');
                    UserFactory.SaveCurrentUser(response.data);
                    $location.url('/');
                  },
                  function() {
                    showToastr('error', 'User could not be created.', 'Error');
                  }
                );
              }
              else {
                showToastr('error', 'An user with this email is already registered.', 'Error');
              }
              vm.isLoading = false;
            },
            function () {
              formatError('Something went wrong.', 'Error validating user existence in database.');
            }
          );
        }
        if (vm.mode == 'U') {
          UserFactory.UpdateUser(vm.user).then(
            function() {
              auditLogs = [];
              compareChanges(userCopy, vm.user, 'User');
              AuditLogFactory.AddAuditLogs(auditLogs);
              vm.isLoading = false;
              showToastr('success', 'User successfully updated.', 'Success');
              vm.switchMode('V');
            },
            function(response) {
              showToastr('error', 'Something went wrong. Details:' + response, 'Error');
              vm.isLoading = false;
            }
          );
        }
      }
      else {
        showToastr('error', 'Please review the errors in the form before proceeding.', 'Invalid fields');
      }
    }

    function compareChanges(oldObject, newObject, objectType) {
      for (var property in oldObject) {
        if (angular.isObject(oldObject[property])) {
          if (property === 'Address') {
            compareChanges(oldObject[property], newObject[property], 'Address')
          }
          if (property === 'Phones') {
            comparePhoneChanges(oldObject[property], angular.copy(newObject[property]))
          }
        }
        else {
          if (oldObject[property] != newObject[property]) {
            auditLogs.push({ Field_Name: property, Previous_Value: oldObject[property], New_Value: newObject[property], Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: objectType, Object_Id: userCopy.User_Id });
            // console.log('A change happened in ' + property + ' it changed from ' + oldObject[property] + ' to ' + newObject[property]);
          }
        }
      }
    }

    function comparePhoneChanges(oldPhones, newPhones) {
      for (var i = 0; i < oldPhones.length; i++) {
        var newPhonesSearch = $filter('filter')(newPhones, { Phone_Id: oldPhones[i].Phone_Id });

        if (newPhonesSearch.length > 0) {
          var index = newPhones.indexOf(newPhonesSearch[0]);
          compareChanges(oldPhones[i], newPhonesSearch[0], 'Phone');
          newPhones.splice(index, 1);
        } 
        else {
          auditLogs.push({ Details: 'Phone ' + oldPhones[i].Phone_Number + ' was removed.' , Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: 'Phone' });
        }
      }

      for (i = 0; i < newPhones.length; i++) {
        auditLogs.push({ Details: 'Phone ' + newPhones[i].Phone_Number + ' was added.' , Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: 'Phone' });
      }
    }

    function formatError(title, description) {
      vm.errorTitle = title;
      vm.errorDescription = description;
      vm.isLoading = false;
      vm.error = true;
    }

    function switchMode(mode) {
      vm.mode = mode;
      UserFactory.SetCurrentManageUserMode(mode);

      if (vm.mode == 'V') {
        vm.action = 'User Profile Information';
      } else if (vm.mode == 'C') {
        vm.user = {};
        vm.user.Address = {};
        vm.user.Phones = [];
        vm.action = 'Create New User Profile';
      } else if (vm.mode == 'U') {
        vm.action = 'Update User Profile';
        vm.user.ConfirmPassword = vm.user.Password
        userCopy = angular.copy(vm.user); // Create user copy before editing
      } else {
        vm.action = 'User Profile Information';
      }
    }

    function addPhoneNumber(phoneForm) {
      vm.submittedPhone = true;
      vm.tempPhoneNumber.Phone_Type = vm.selectedPhoneType;

      if (phoneForm.$valid) {
        if (!isNullOrWhitespace(vm.tempPhoneNumber.Phone_Number) && !isNullOrWhitespace(vm.tempPhoneNumber.Phone_Type)) {
          var filterResult = $filter('filter')(vm.user.Phones, { Phone_Number: vm.tempPhoneNumber.Phone_Number });

          if (filterResult.length > 0) {
            showToastr('error', 'Phone number was already added.', 'Error');
          }
          else {
            vm.user.Phones.push({
              Phone_Number: vm.tempPhoneNumber.Phone_Number,
              Phone_Type: vm.tempPhoneNumber.Phone_Type,
              User_Id: vm.user.User_Id == 0 || vm.user.User_Id == null ? null : vm.user.User_Id
            })
    
            vm.tempPhoneNumber = {};
            showToastr('success', 'Phone added successfully.');
          }
        }
        else {
          showToastr('error', 'Fields cannot be empty', 'Error');
        }
      }
    }

    function removePhoneNumber(index) {
      if (vm.user.Phones.length == 1) {
        showToastr('error', 'You must have at least 1 phone number.', 'Error');
      } else {
        vm.user.Phones.splice(index, 1);
      }
    }

    function openModal(size) {
      vm.tempPhoneNumber = {};

      modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'managePhoneNumbers.html',
        scope: $scope,
        size: size,
        keyboard: false,
        backdrop: 'static'
      });
    }

    function closeModal() {
      modalInstance.close();
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

    function isNullOrWhitespace( input ) {
      if (typeof input === 'undefined' || input == null) {
        return true;
      }

      return input.replace(/\s/g, '').length < 1;
    }
  }
})();
