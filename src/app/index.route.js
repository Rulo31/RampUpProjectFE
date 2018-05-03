(function() {
  'use strict';

  angular
    .module('rampUpProjectFe')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/Business/ManageBusiness', {
        templateUrl: 'app/business/manageBusiness/manageBusiness.html',
        controller: 'ManageBusinessController',
        controllerAs: 'vm',
        access: {
					loginRequired: true
				}
      })
      .when('/Business/MyBusinesses', {
        templateUrl: 'app/business/myBusinesses/myBusinesses.html',
        controller: 'MyBusinessesController',
        controllerAs: 'vm',
        access: {
					loginRequired: true
				}
      })
      .when('/Reservation/MyReservations', {
        templateUrl: 'app/reservation/myReservations/myReservations.html',
        controller: 'MyReservationsController',
        controllerAs: 'vm',
        access: {
					loginRequired: true
				}
      })
      .when('/Reservation/MakeReservation', {
        templateUrl: 'app/reservation/makeReservation/makeReservation.html',
        controller: 'MakeReservationController',
        controllerAs: 'vm',
        access: {
					loginRequired: true
				}
      })
      .when('/User/ManageUser', {
        templateUrl: 'app/user/manageUser.html',
        controller: 'ManageUserController',
        controllerAs: 'vm',
        access: {
					loginRequired: true
				}
      })
      .when('/User/RegisterUser', {
        templateUrl: 'app/user/manageUser.html',
        controller: 'ManageUserController',
        controllerAs: 'vm',
        access: {
					loginRequired: false
				}
      })
      .when('/', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'vm',
        access: {
					loginRequired: false
				}
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
