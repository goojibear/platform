'use strict';

/**
 * @ngdoc overview
 * @name goojibearApp
 * @description
 * # goojibearApp
 *
 * Main module of the application.
 */
angular
  .module('goojibearApp')
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/spa/reports");

    $stateProvider
      .state('spa', {
        url: '/spa',
        templateUrl: 'views/platform.html',
        controller: 'platformCtrl',
        controllerAs: 'platform'
      })
      .state('spa.reports', {
        url: '/reports',
        templateUrl: 'views/reports.html',
        controller: 'reportsCtrl',
        controllerAs: 'reports'
      })
      .state('spa.dataManagement', {
        url: '/dataManagement',
        templateUrl: 'views/dataManagement.html',
        controller: 'dataManagementCtrl',
        controllerAs: 'dataManagement'
      })
      .state('spa.queryBuilder', {
        url: '/queryBuilder',
        templateUrl: 'views/queryBuilder.html',
        controller: 'queryBuilderCtrl',
        controllerAs: 'queryBuilder'
      });
  });


