(function() {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .controller('MyBusinessesController', MyBusinessesController);

  /** @ngInject */
  function MyBusinessesController(UserFactory, BusinessFactory, BranchFactory, $uibModal, $scope, toastr, $filter, $location) {
    var vm = this;
    var modalInstance;
    vm.openModal = openModal;
    vm.switchToManageBusiness = switchToManageBusiness;
    vm.removeBusiness = removeBusiness;
    vm.okModal = okModal;
    vm.dismissModal = dismissModal;

    init();

    function init() {      
      vm.isLoading = true;
      vm.user = UserFactory.GetCurrentUser();

      BusinessFactory.GetMyBusinesses(vm.user.User_Id).then(
        function(response) {
          vm.businesses = response.data;
          vm.isLoading = false;
        },
        function() {
          vm.isLoading = false;
          showToastr('error', 'Unable to fetch your business from DB.', 'Error');
        }
      );
    }

    function switchToManageBusiness(business, mode) {
      vm.isLoading = true;

      BranchFactory.GetBranchesByBusinessId(business.Business_Id).then(
        function(response) {
          business.Branches = response.data;
          BusinessFactory.SaveCurrentBusiness(business);
          BusinessFactory.SetCurrentManageBusinessMode(mode);
          $location.url('/Business/ManageBusiness');
        },
        function() {
          showToastr('error', 'Unable to fetch business branches from DB.', 'Error');
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

    function removeBusiness (array, index) {
			openModal('deleteModal', 'md');
			modalInstance.result.then(
				function () {
					BusinessFactory.RemoveBusiness(array[index].Business_Id).then(
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
