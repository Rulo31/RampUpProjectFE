'use strict';

/*
	Interact with the web service by providing put/post/get/delete methods
*/
angular.module('rampUpProjectFe')
	.factory('FieldFactory', function($http, UserFactory) {
		var baseUrl = '/api/Field/';

		var GetBasicAuthConfig = function() {
			var currentUser = UserFactory.GetCurrentUser();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(currentUser.Email + ':' + currentUser.Password);
		}

		return {
			AddField: function(field) {
				GetBasicAuthConfig();
				return $http.post(baseUrl + 'AddField', field, GetBasicAuthConfig());
			},
			UpdateField: function(field) {
				GetBasicAuthConfig();
				return $http.put(baseUrl + 'UpdateField', field, GetBasicAuthConfig());
			},
			RemoveField: function(fieldID) {
				GetBasicAuthConfig();
				return $http.delete(baseUrl + 'RemoveField/' + fieldID, GetBasicAuthConfig())
			},
            GetFieldsByBranchId: function(branchId) {
                return $http.get(baseUrl + 'GetFieldsByBranchId/' + branchId, GetBasicAuthConfig());
			},
			GetAllFields: function() {
				GetBasicAuthConfig();
                return $http.get(baseUrl + 'GetAllFields/', GetBasicAuthConfig());
            }
		}
	}
);