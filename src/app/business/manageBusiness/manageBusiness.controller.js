(function () {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .controller('ManageBusinessController', ManageBusinessController);

  /** @ngInject */
  function ManageBusinessController(UserFactory, AuditLogFactory, BusinessFactory, BranchFactory, FieldFactory, $uibModal, $scope, toastr, $filter) {
    var vm = this;
    var auditLogs = [];
    var modalInstance;
    vm.submitBusiness = submitBusiness;
    vm.openModal = openModal;
    vm.addBranch = addBranch;
    vm.addField = addField;
    vm.switchMode = switchMode;
    vm.updateBranch = updateBranch;
    vm.updateField = updateField;
    vm.openBranchModal = openBranchModal;
    vm.removeBranch = removeBranch;
    vm.okModal = okModal;
    vm.Branches = [];
    vm.dismissModal = dismissModal;
    vm.openFieldModal = openFieldModal; 
    vm.removeField = removeField;
    vm.selectedMaterial =  'Synthetic';

    vm.materials = [
      'Grass',
      'Synthetic'
    ]


    init();

    function init() {
      BusinessFactory.GetCurrentManageBusinessMode().then(
        function (response) {
          switchMode(response);
          vm.user = UserFactory.GetCurrentUser();
          if (vm.mode != 'C') {
            BusinessFactory.GetCurrentBusiness().then(
              function (response) {
                vm.business = response;
                vm.Branches = vm.business.Branches;

                if (vm.business.Branches.length == 0) {
                  vm.noElementsFound = true;
                }
              }
            );
          }
        }
      );
    }

    function addField(fieldForm) {
      vm.submittedField = true;

      if (fieldForm.$valid) {
        vm.isLoadingField = true;
        vm.tempAddress.Creation_Date = new Date();

        var fieldToBeAdded = {
          Name: vm.tempField.Name,
          Number: vm.tempField.Number,
          Width: vm.tempField.Width,
          Length: vm.tempField.Length,
          Material: vm.selectedMaterial,
          Cost: vm.tempField.Cost,
          Branch_Id: vm.tempField.Branch_Id
        };

        FieldFactory.AddField(fieldToBeAdded).then(
          function (response) {
            fieldToBeAdded = response.data;
            var affectedBranch = $filter('filter')(vm.business.Branches, { Branch_Id: fieldToBeAdded.Branch_Id });
            var index = vm.business.Branches.indexOf(affectedBranch[0]);

            if (angular.isUndefined(vm.business.Branches[index].Fields) || vm.business.Branches[index].Fields == null) {
              vm.business.Branches[index].Fields = [];
            }

            vm.business.Branches[index].Fields.push(fieldToBeAdded);
            BusinessFactory.SaveCurrentBusiness(vm.business)

            auditLogs = [];
            auditLogs.push({ Details: 'Field ' + fieldToBeAdded.Field_Id + ' was added.' , Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: 'Field' });
            AuditLogFactory.AddAuditLogs(auditLogs);


            vm.noElementsFound = false;
            vm.tempField = {};
            vm.submittedField = false;
            vm.isLoadingField = false;
            okModal();
            showToastr('success', 'Field added successfully.');
          },
          function () {
            vm.isLoadingField = false;
            showToastr('error', 'Fields could not be added.');
          }
        );
      }
    }

    function addBranch(branchForm) {
      vm.submittedBranch = true;

      if (branchForm.$valid) {
        vm.isLoadingBranch = true;
        vm.tempAddress.Creation_Date = new Date();

        var branchToBeAdded = {
          Name: vm.tempBranch.Name,
          Email: vm.tempBranch.Email,
          Phones: [{ Phone_Number: vm.tempBranch.Phone_Number, Phone_Type: 'Business' }],
          Address: vm.tempAddress,
          Creation_Date: new Date(),
          Business_Id: vm.business.Business_Id
        };

        BranchFactory.AddBranch(branchToBeAdded).then(
          function (response) {
            branchToBeAdded = response.data;
            vm.Branches.push(branchToBeAdded);
            vm.business.Branches = vm.Branches;
            BusinessFactory.SaveCurrentBusiness(vm.business)

            auditLogs = [];
            auditLogs.push({ Details: 'Branch ' + branchToBeAdded.Branch_Id + ' was added.' , Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: 'Branch' });
            AuditLogFactory.AddAuditLogs(auditLogs);

            vm.noElementsFound = false;
            vm.tempBranch = {};
            vm.tempAddress = {};
            vm.submittedBranch = false;
            vm.isLoadingBranch = false;
            okModal();
            showToastr('success', 'Branch added successfully.');
          },
          function () {
            vm.isLoadingBranch = false;
            showToastr('error', 'Branches could not be added.');
          }
        );
      }
    }

    function removeBranch(array, index) {
      openModal('deleteModal', 'md');
      modalInstance.result.then(
        function () {
          vm.isLoadingBranch = true;

          if (array[index].Branch_Id == null) {
            array.splice(index, 1);

            if (array.length == 0) {
              vm.noElementsFound = true;
            }

            vm.business.Branches = vm.Branches;
            BusinessFactory.SaveCurrentBusiness(vm.business)
            vm.isLoadingBranch = false;
          } else {
            BranchFactory.RemoveBranch(array[index].Branch_Id).then(
              function () {
                auditLogs = [];
                auditLogs.push({ Details: 'Branch ' + array[index].Branch_Id + ' was removed.' , Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: 'Branch' });
                AuditLogFactory.AddAuditLogs(auditLogs);

                array.splice(index, 1);
  
                if (array.length == 0) {
                  vm.noElementsFound = true;
                }
  
                vm.business.Branches = vm.Branches;
                BusinessFactory.SaveCurrentBusiness(vm.business)

                vm.isLoadingBranch = false;
                showToastr('success', 'Branch deleted successfully.');
              },
              function () {
                formatError('Something went wrong.', 'Error removing branch from database.');
                showToastr('error', 'Branch could not be deleted.');
              }
            );
          }
        }
      );
    }

    function formatError(title, description) {
      vm.errorTitle = title;
      vm.errorDescription = description;
      vm.isLoading = false;
      vm.error = true;
    }

    function removeField(array, fieldIndex) {
      openModal('deleteFieldModal', 'md');
      modalInstance.result.then(
        function () {
          vm.isLoadingField = true;

          if (array[fieldIndex].Field_Id == null) {
            var affectedBranch = $filter('filter')(vm.business.Branches, { Branch_Id: array[fieldIndex].Branch_Id });
            var index = vm.business.Branches.indexOf(affectedBranch[0]);

            array.splice(fieldIndex, 1);
            vm.business.Branches[index].Fields = array;
            BusinessFactory.SaveCurrentBusiness(vm.business)
            vm.isLoadingField = false;
          } 
          else {
            FieldFactory.RemoveField(array[fieldIndex].Field_Id).then(
              function () {
                auditLogs = [];
                auditLogs.push({ Details: 'Field ' + array[fieldIndex].Field_Id + ' was removed.' , Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: 'Field' });
                AuditLogFactory.AddAuditLogs(auditLogs);

                var affectedBranch = $filter('filter')(vm.business.Branches, { Branch_Id: array[fieldIndex].Branch_Id });
                var index = vm.business.Branches.indexOf(affectedBranch[0]);
                array.splice(fieldIndex, 1);
                vm.business.Branches[index].Fields = array;
                BusinessFactory.SaveCurrentBusiness(vm.business)
                vm.isLoadingField = false;
                showToastr('success', 'Field deleted successfully.');
              },
              function () {
                formatError('Something went wrong.', 'Error removing field from database.');
                showToastr('error', 'Field could not be deleted.');
              }
            );
          }
        }
      );
    }

    function okModal() {
      modalInstance.close();
    }

    function dismissModal() {
      modalInstance.dismiss();
    }

    function openBranchModal(mode, branch, index) {
      vm.submittedBranch = false;

      if (mode == 'C') {
        vm.tempBranch = {};
        vm.tempAddress = {};
        vm.branchMode = 'C';
        openModal('addBranches.html', 'md');
      }
      if (mode == 'U' || mode == 'V') {
        vm.branchMode = mode;
        vm.tempBranch = {};
        vm.tempBranch = angular.copy(branch);
        vm.tempBranch.index = index;
        vm.tempBranch.Phone_Number = branch.Phones[0].Phone_Number;
        vm.tempAddress = branch.Address;
        openModal('addBranches.html', 'md');
      }
    }

    function openFieldModal(mode, branch, index) {
      vm.submittedField = false;

      if (mode == 'C') {
        vm.tempField = {};
        vm.tempAddress = {};
        vm.fieldMode = 'C';
        vm.tempField.Branch_Id = branch.Branch_Id;
        openModal('addFields.html', 'md');
      }
      if (mode == 'U' || mode == 'V') {
        vm.fieldMode = mode;
        vm.tempField = {};
        vm.tempField = angular.copy(branch);
        vm.tempField.index = index;
        openModal('addFields.html', 'md');
      }
    }

    function updateBranch(branchForm) {
      vm.submittedBranch = true;

      if (branchForm.$valid) {
        vm.isLoadingBranch = true;
        vm.tempBranch.Phones[0].Phone_Number = vm.tempBranch.Phone_Number;
        vm.tempBranch.Address = vm.tempAddress;

        BranchFactory.UpdateBranch(vm.tempBranch).then(
          function () {        
            auditLogs = [];
            compareChanges(vm.Branches[vm.tempBranch.index], vm.tempBranch, "Branch", vm.tempBranch.Branch_Id);
            AuditLogFactory.AddAuditLogs(auditLogs);

            vm.Branches[vm.tempBranch.index] = vm.tempBranch;
            vm.business.Branches = vm.Branches;
            BusinessFactory.SaveCurrentBusiness(vm.business);
            vm.isLoadingBranch = false;
            okModal();
            showToastr('success', 'Branch updated successfully.');
          },
          function () {
            showToastr('error', 'Branch could not be added.');
            vm.isLoadingBranch = false;
          }
        );
      }
    }

    function updateField(fieldForm) {
      vm.submittedField = true;

      if (fieldForm.$valid) {
        vm.isLoadingField = true;
        FieldFactory.UpdateField(vm.tempField).then(
          function () {       
            var affectedBranch = $filter('filter')(vm.business.Branches, { Branch_Id: vm.tempField.Branch_Id });
            var index = vm.business.Branches.indexOf(affectedBranch[0]);

            auditLogs = [];
            compareChanges(vm.business.Branches[index].Fields[vm.tempField.index], vm.tempField, "Field", vm.tempField.Field_Id);
            AuditLogFactory.AddAuditLogs(auditLogs);

            vm.business.Branches[index].Fields[vm.tempField.index] = vm.tempField;
            BusinessFactory.SaveCurrentBusiness(vm.business);
            vm.isLoadingField = false;
            okModal();
            showToastr('success', 'Field updated successfully.');
          },
          function () {
            showToastr('error', 'Field could not be added.');
            vm.isLoadingField = false;
          }
        );
      }
    }

    function compareChanges(oldObject, newObject, objectType, objectId) {
      for (var property in oldObject) {
        if (angular.isObject(oldObject[property])) {
          console.log('It is an object!');
        }
        else {
          if (oldObject[property] != newObject[property]) {
            auditLogs.push({ Field_Name: property, Previous_Value: oldObject[property], New_Value: newObject[property], Timestamp: new Date, User_Id: vm.user.User_Id, User_Name: vm.user.Email , Object_Type: objectType, Object_Id: objectId });
          }
        }
      }
    }

    function submitBusiness(businessForm) {
      vm.submitted = true;

      if (businessForm.$valid) {
        vm.isLoading = true;
        vm.business.Creation_Date = new Date();
        vm.business.Branches = vm.Branches;
        vm.business.User_Id = vm.user.User_Id

        if (vm.mode == 'C') {
          BusinessFactory.AddBusiness(vm.business).then(
            function (response) {
              vm.business.Business_Id = response.data;
              showToastr('success', 'Business successfully added.');
              vm.isLoading = false;
            },
            function () {
              showToastr('error', 'Business could not be added.');
              vm.isLoading = false;
            }
          );
        }
        if (vm.mode == 'U') {
          BusinessFactory.UpdateBusiness(vm.business).then(
            function () {
              vm.isLoading = false;
              BusinessFactory.SaveCurrentBusiness(vm.business);
              showToastr('success', 'Business successfully updated.');
            },
            function () {
              showToastr('error', 'Business could not be added.');
              vm.isLoading = false;
            }
          );
        }
      }
    }

    function switchMode(mode) {
      vm.mode = mode;
      UserFactory.SetCurrentManageUserMode(mode);

      if (vm.mode == 'V') {
        vm.action = 'Business Information';
      } else if (vm.mode == 'C') {
        vm.user = {};
        vm.user.Address = {};
        vm.user.Phones = [];
        vm.action = 'Create New Business';
      } else if (vm.mode == 'U') {
        vm.action = 'Update Business';
      } else {
        vm.action = 'Business Information';
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
  }
})();
