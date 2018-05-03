'use strict';

angular.module('rampUpProjectFe')
    .run(['$rootScope', '$location', 'AuthorizationFactory', 'UserFactory', function($rootScope, $location, authorization, authentication) {

        var routeChangeRequiredAfterLogin = false,
            loginRedirectUrl;

        var run = $rootScope.$on('$routeChangeStart', function(event, next) {
            routeChangeRequiredAfterLogin = false;
            var authorised;
            var user = authentication.GetCurrentUser();

            if (routeChangeRequiredAfterLogin && next.originalPath !== authentication.authorization.routes.login) {
                routeChangeRequiredAfterLogin = false;
                $location.path(loginRedirectUrl).replace();
            }
            else if (angular.isDefined(next.access)) {
                authorization.authorize(next.access.loginRequired, next.access.permissions, next.access.permissionCheckType).then(
                    function(data) {
                        authorised = data;
                        if (authorised === authentication.authorization.enums.authorised.loginRequired) {
                            routeChangeRequiredAfterLogin = true;
                            loginRedirectUrl = authentication.authorization.routes.login;
                            $location.path(loginRedirectUrl);
                        }
                        else {
                            if (authorised === authentication.authorization.enums.authorised.notAuthorised) {
                                $location.path(authentication.authorization.routes.notAuthorised).replace();
                            }

                            if (user !== null) {

                                if (angular.isDefined(user) && authorised === authentication.authorization.enums.authorised.authorised && next.originalPath === authentication.authorization.routes.login) {
                                    $location.path(authentication.authorization.routes.mainMenu);
                                }
                            }
                            else {
                                $location.path(authentication.authorization.routes.login);
                            }
                        }
                    }
                );
            }
        });
    }]);