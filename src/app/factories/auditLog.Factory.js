'use strict';

/*
	Interact with the web service by providing put/post/get/delete methods
*/
angular.module('rampUpProjectFe')
	.factory('AuditLogFactory', function($http, $filter) {
		var baseUrl = 'node/';

		return {
			AddAuditLogs: function(auditLogs) {
				var auditLogHashKeys = $filter('filter')(auditLogs, { Field_Name: "$$hashKey" });

				for(var i = 0; i < auditLogHashKeys.length > 0; i++) {
					var index = auditLogs.indexOf(auditLogHashKeys[i]);
            		auditLogs.splice(index, 1);
				}

				if (auditLogs.length > 0) {
					var AuditLogs = {
						AuditLogs: auditLogs
					}

					return $http.post(baseUrl + 'AuditLog', AuditLogs);
				}
			}
		}
	}
);