'use strict';

/*
	Interact with the web service by providing put/post/get/delete methods
*/
angular.module('rampUpProjectFe')
	.factory('UserFactory', function($http, $q, $rootScope) {
		var baseUrl = '/api/User/';
		var currentUser = null;
		var currentManageUserMode = null;

		var GetBasicAuthConfig = function() {
			var currentUser = GetCurrentUser();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(currentUser.Email + ':' + currentUser.Password);
		}

		var SaveCurrentUser = function(user) {
			sessionStorage.setItem('RampUpProjectFE.CurrentUser', angular.toJson(user));
			currentUser = user;
		}

		var GetCurrentUser = function() {
			if (angular.isUndefined(currentUser) || currentUser == null) {
				currentUser = angular.fromJson(sessionStorage.getItem('RampUpProjectFE.CurrentUser'));
			}

			if (currentUser != null && angular.isDefined(currentUser)) {
				$rootScope.loggedUser = true;
			}
			else {
				$rootScope.loggedUser = false;
			}
			
			return currentUser;
		}

		var RemoveCurrentUser = function() {
			sessionStorage.removeItem('RampUpProjectFE.CurrentUser');
			sessionStorage.removeItem('RampUpProjectFE.CurrentManageUserMode');
			currentUser = null;
		}
		
		var RemoveCurrentBusiness = function() {
			sessionStorage.removeItem('RampUpProjectFE.CurrentBusiness');
			sessionStorage.removeItem('RampUpProjectFE.CurrentManageBusinessMode');
		}

		var SetCurrentManageUserMode = function(mode) {
			sessionStorage.setItem('RampUpProjectFE.CurrentManageUserMode', mode);
			currentManageUserMode = mode;
		}

		var GetCurrentManageUserMode = function() {
			var deferred = $q.defer();

			if (angular.isUndefined(currentManageUserMode) || currentManageUserMode == null) {
				currentManageUserMode = sessionStorage.getItem('RampUpProjectFE.CurrentManageUserMode');
			}

			deferred.resolve(currentManageUserMode);

			return deferred.promise;
		}

		var authorization =
		{
			name: 'auth',
			enums: {
				authorised: {
					authorised: 0,
					loginRequired: 1,
					notAuthorised: 2
				},
				permissionCheckType: {
					atLeastOne: 0,
					combinationRequired: 1
				}
			},
			events: {
				userLoggedIn: 'auth:user:loggedIn',
				userLoggedOut: 'auth:user:loggedOut'
			},
			controllers: {
				login: 'LoginController'
			},
			services: {
				authentication: 'authentication',
				authorization: 'authorization'
			},
			routes: {
				login: '/',
				notAuthorised: '/notAuthorized',
				mainMenu: '/'
			}
		}

		return {
			AddUser: function(user) {
				return $http.post(baseUrl + 'AddUser', user);
			},
			UpdateUser: function(user) {
				var deferred = $q.defer();
				GetBasicAuthConfig();

				$http.put(baseUrl + 'UpdateUser', user).then(
					function() {
						SaveCurrentUser(user);
						deferred.resolve();
					},
					function() {
						deferred.reject();
					}
				);

				return deferred.promise;
			},
			Login: function(user) {
				var deferred = $q.defer();

				$http.post(baseUrl + 'Login', user).then(
					function(response) {
						SaveCurrentUser(response.data);
						SetCurrentManageUserMode('V');
						deferred.resolve(currentUser);
					},
					function() {
						deferred.reject();
					}
				);

				return deferred.promise;
			},
			Logout: function() {
				RemoveCurrentUser();
				RemoveCurrentBusiness();
			},
			IsUserRegistered: function(user) {
				return $http.post(baseUrl + 'IsUserRegistered', user);
			},
			SaveCurrentUser: SaveCurrentUser,
			GetCurrentUser: GetCurrentUser,
			SetCurrentManageUserMode: SetCurrentManageUserMode,
			GetCurrentManageUserMode: GetCurrentManageUserMode,
			authorization: authorization
		}
	}
);