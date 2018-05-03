(function () {
    'use strict';

    angular.module('rampUpProjectFe').factory('AuthorizationFactory', AuthorizationFactory);

    /* @ngInject */
    function AuthorizationFactory(UserFactory, $q) {

        function authorize(loginRequired, requiredPermissions, permissionCheckType) {
            var deferred = $q.defer();

            var result = UserFactory.authorization.enums.authorised.authorised,
                loweredPermissions = [],
                hasPermission = true,
                permission, i,
                user = UserFactory.GetCurrentUser();
            var isUndefinedOrNull = angular.isUndefinedOrNull(user);

            permissionCheckType = permissionCheckType || UserFactory.authorization.enums.permissionCheckType.atLeastOne;

            if (loginRequired && isUndefinedOrNull) {
                result = UserFactory.authorization.enums.authorised.loginRequired;
                deferred.resolve(result);
            }
            else if ((loginRequired && !isUndefinedOrNull) && (angular.isUndefined(requiredPermissions) || requiredPermissions.length === 0)) {
                // Login is required but no specific permissions are specified.
                result = UserFactory.authorization.enums.authorised.authorised;
                deferred.resolve(result);
            }
            else if (requiredPermissions) {
                if (angular.isString(user.Roles))
                    user.Roles = [user.Roles];

                loweredPermissions = user.Roles.join('|').toLowerCase().split('|');

                for (i = 0; i < requiredPermissions.length; i += 1) {
                    permission = requiredPermissions[i].toLowerCase();

                    if (permissionCheckType === UserFactory.authorization.enums.permissionCheckType.combinationRequired) {
                        hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                        // if all the permissions are required and hasPermission is false there is no point carrying on
                        if (hasPermission === false) {
                            break;
                        }
                    }
                    else if (permissionCheckType === UserFactory.authorization.enums.permissionCheckType.atLeastOne) {
                        hasPermission = loweredPermissions.indexOf(permission) > -1;
                        // if we only need one of the permissions and we have it there is no point carrying on
                        if (hasPermission) {
                            break;
                        }
                    }
                }

                result = hasPermission ? UserFactory.authorization.enums.authorised.authorised : UserFactory.authorization.enums.authorised.notAuthorised;
                deferred.resolve(result);
            }
            return deferred.promise;
        };

        return {
            authorize: authorize
        };
    }
})();
angular.isUndefinedOrNull = function(val) {
    return angular.isUndefined(val) || val === null
}