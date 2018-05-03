'use strict';

/*
	Interact with the web service by providing put/post/get/delete methods
*/
angular.module('rampUpProjectFe')
	.factory('BusinessFactory', function($http, $q, UserFactory) {
		var baseUrl = '/api/Business/';
		var currentBusiness = null;
		var currentManageBusinessMode = null;

		var GetBasicAuthConfig = function() {
			var currentUser = UserFactory.GetCurrentUser();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(currentUser.Email + ':' + currentUser.Password);
		}

		var SaveCurrentBusiness = function(business) {
			sessionStorage.setItem('RampUpProjectFE.CurrentBusiness', angular.toJson(business));
			currentBusiness = business;
		}

		var GetCurrentBusiness = function() {
			var deferred = $q.defer();

			if (angular.isUndefined(currentBusiness) || currentBusiness == null) {
				currentBusiness = angular.fromJson(sessionStorage.getItem('RampUpProjectFE.CurrentBusiness'));
			}
			
			deferred.resolve(currentBusiness);

			return deferred.promise;
		}

		var SetCurrentManageBusinessMode = function(mode) {
			sessionStorage.setItem('RampUpProjectFE.CurrentManageBusinessMode', mode);
			currentManageBusinessMode = mode;
		}

		var GetCurrentManageBusinessMode = function() {
			var deferred = $q.defer();

			if (angular.isUndefined(currentManageBusinessMode) || currentManageBusinessMode == null) {
				currentManageBusinessMode = sessionStorage.getItem('RampUpProjectFE.CurrentManageBusinessMode');
			}

			deferred.resolve(currentManageBusinessMode);

			return deferred.promise;
		}

		return {
			AddBusiness: function(business) {
				GetBasicAuthConfig();
				return $http.post(baseUrl + 'AddBusiness', business);
			},
			UpdateBusiness: function(business) {
				var deferred = $q.defer();
				GetBasicAuthConfig();

				$http.put(baseUrl + 'UpdateBusiness', business).then(
					function() {
						SaveCurrentBusiness(business);
						deferred.resolve();
					},
					function() {
						deferred.reject();
					}
				);

				return deferred.promise;
			},
			GetMyBusinesses: function(businessID) {
				GetBasicAuthConfig();
				return $http.get(baseUrl + 'GetMyBusinesses/' + businessID)
			},
			RemoveBusiness: function(businessID) {
				GetBasicAuthConfig();
				return $http.delete(baseUrl + 'RemoveBusiness/' + businessID)
			},
			SaveCurrentBusiness: SaveCurrentBusiness,
			GetCurrentBusiness: GetCurrentBusiness,
			SetCurrentManageBusinessMode: SetCurrentManageBusinessMode,
			GetCurrentManageBusinessMode: GetCurrentManageBusinessMode
		}
	}
);