(function() {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .directive('acmeNavbar', acmeNavbar);

  /** @ngInject */
  function acmeNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
          creationDate: '='
      },
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController(BusinessFactory, UserFactory, $location, $rootScope, $route) {
      var vm = this;
      vm.createNewBusiness = createNewBusiness;
      vm.logout = logout;

      init();

      function init() {
        vm.user = UserFactory.GetCurrentUser();
      }

      function createNewBusiness() {
        BusinessFactory.SetCurrentManageBusinessMode('C');
        $location.url('/Business/ManageBusiness');
      }

      function logout() {
        UserFactory.Logout();
        $route.reload();
        $location.url('/');
      }
    }
  }

})();
