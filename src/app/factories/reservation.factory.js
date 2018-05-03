'use strict';

/*
	Interact with the web service by providing put/post/get/delete methods
*/
angular.module('rampUpProjectFe')
	.factory('ReservationFactory', function($http, $q, UserFactory) {
		var baseUrl = '/api/Reservation/';
		var currentReservation = null;
		var currentMakeReservationMode = null;

		var GetBasicAuthConfig = function() {
			var currentUser = UserFactory.GetCurrentUser();
			$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(currentUser.Email + ':' + currentUser.Password);
		}

		var SaveCurrentReservation = function(reservation) {
			sessionStorage.setItem('RampUpProjectFE.CurrentReservation', angular.toJson(reservation));
			currentReservation = reservation;
		}

		var GetCurrentReservation = function() {
			var deferred = $q.defer();

			if (angular.isUndefined(currentReservation) || currentReservation == null) {
				currentReservation = angular.fromJson(sessionStorage.getItem('RampUpProjectFE.CurrentReservation'));
			}
			
			deferred.resolve(currentReservation);

			return deferred.promise;
		}

		var SetCurrentMakeReservationMode = function(mode) {
			sessionStorage.setItem('RampUpProjectFE.CurrentMakeReservationMode', mode);
			currentMakeReservationMode = mode;
		}

		var GetCurrentMakeReservationMode = function() {
			var deferred = $q.defer();

			if (angular.isUndefined(currentMakeReservationMode) || currentMakeReservationMode == null) {
				currentMakeReservationMode = sessionStorage.getItem('RampUpProjectFE.CurrentMakeReservationMode');
			}

			deferred.resolve(currentMakeReservationMode);

			return deferred.promise;
		}

		return {
			AddReservation: function(reservation) {
				GetBasicAuthConfig();
				return $http.post(baseUrl + 'AddReservation', reservation);
			},
			GetMyReservations: function(userID) {
				GetBasicAuthConfig();
				return $http.get(baseUrl + 'GetMyReservations/' + userID)
			},
			GetReservationsPerDay: function(date, fieldID) {
				GetBasicAuthConfig();
				return $http.get(baseUrl + 'GetReservationsPerDay/' + date + '/' + fieldID)
			},
			RemoveReservation: function(reservationID) {
				GetBasicAuthConfig();
				return $http.delete(baseUrl + 'RemoveReservation/' + reservationID)
			},
			SaveCurrentReservation: SaveCurrentReservation,
			GetCurrentReservation: GetCurrentReservation,
			SetCurrentMakeReservationMode: SetCurrentMakeReservationMode,
			GetCurrentMakeReservationMode: GetCurrentMakeReservationMode
		}
	}
);