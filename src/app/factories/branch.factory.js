'use strict';

/*
	Interact with the web service by providing put/post/get/delete methods
*/
angular.module('rampUpProjectFe')
	.factory('BranchFactory', function($http, UserFactory) {
		var baseUrl = '/api/Branch/';

		var GetBasicAuthConfig = function() {
			var currentUser = UserFactory.GetCurrentUser();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(currentUser.Email + ':' + currentUser.Password);
		}

		return {
			AddBranch: function(branch) {
				GetBasicAuthConfig();
				return $http.post(baseUrl + 'AddBranch', branch);
			},
			AddBranches: function(branches) {
				GetBasicAuthConfig();
				return $http.post(baseUrl + 'AddBranches', branches);
			},
			UpdateBranch: function(branch) {
				GetBasicAuthConfig();
				return $http.put(baseUrl + 'UpdateBranch', branch);
			},
			UpdateBranches: function(branches) {
				GetBasicAuthConfig();
				return $http.put(baseUrl + 'UpdateBranches', branches);
			},
			RemoveBranch: function(branchID) {
				GetBasicAuthConfig();
				return $http.delete(baseUrl + 'RemoveBranch/' + branchID)
			},
            GetBranchesByBusinessId: function(businessID) {
				GetBasicAuthConfig();
                return $http.get(baseUrl + 'GetBranchesByBusinessId/' + businessID);
            }
		}
	}
);