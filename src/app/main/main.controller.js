(function() {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($route, toastr, UserFactory, $location, $rootScope) {
    var vm = this;
    vm.modules = [];
    vm.classAnimation = '';
    vm.showToastr = showToastr;
    vm.login = login;

    activate();

    function activate() {
      getModules();
      vm.user = UserFactory.GetCurrentUser();
    }

    function login() {
      if (!isNullOrWhitespace(vm.email) && !isNullOrWhitespace(vm.password)) {
        vm.isLoading = true;

        var user = {
          email: vm.email,
          password: vm.password
        }

        UserFactory.Login(user).then(
          function () {
            vm.isLoading = false;
            $rootScope.loggedUser = true;
            $route.reload();
            // $location.url('/User/ManageUser');
          },
          function () {
            vm.isLoading = false;
            showToastr('error', 'Incorrect Email address or password are not correct.', 'Invalid login')
          }
        )
      }
      else {
        showToastr('error', 'Email Address or password cannot be empty.', 'Invalid login')
      } 
    }

    function getModules() {
      vm.modules = [
        {
          'title': 'Profile',
          'url1': '#/User/ManageUser',
          'description1': 'Manage your existing profile.',
          'logo': 'user.png'
        },
        {
          'title': 'Business',
          'url1': '#/Business/ManageBusiness',
          'description1': 'Add yourself as a business and add your soccer fields to be reserved.',
          'url2': '#/Business/MyBusinesses',
          'description2': 'View your business and manage them as you want.',
          'logo': 'dollar.png'
        },
        {
          'title': 'Reservations',
          'url1': '#/Reservation/MyReservations',
          'description1': 'View / Cancel your existing reservations.',
          'url2': '#/Reservation/MakeReservation',
          'description2': 'Reserve a soccer field for your matches.',
          'logo': 'soccer.png'
        }
      ];
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
