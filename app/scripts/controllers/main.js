'use strict';

/**
 * @ngdoc function
 * @name goojibearApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the goojibearApp
 */
(function(){
  angular.module('goojibearApp').controller('mainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', '$window', '$http', '$q'];

  function MainCtrl($scope, $window, $http, $q) {
    var self = this;
    self.scope = $scope;
    self.gridHeight = $window.innerHeight - 60 + 'px';
    self.uniqueKeyMap = {};
    var gridData = [];

    var clickPromise = $http({
      method: 'GET',
      url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/clickTracking'
    });
    var pagePromise = $http({
      method: 'GET',
      url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/pageTracking'
    });
    var phonePromise = $http({
      method: 'GET',
      url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/phoneTracking'
    });
    $q.all([clickPromise, pagePromise, phonePromise]).then(function successCallback(response) {
      self.clicks = response[0].data;
      self.pages = response[1].data;
      self.phones = response[2].data;
      prepareData();
    }, function errorCallback(response) {
      console.log(response);
    });





    self.gridData = {
      data: gridData,
      enableRowSelection: true,
      enableRowHeaderSelection: false,
      multiSelect: false,
      enableGridMenu: true,
      enableSelectAll: true,
      exporterCsvFilename: 'myFile.csv',
      exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
      onRegisterApi: function (gridApi) {
        self.gridApi = gridApi;
        //gridApi.selection.on.rowSelectionChanged(self.scope, self.rowSelected);
      }
    };

//    self.rowSelected = function(gridRow, event){

        //    };
    function prepareData(){
      var gridMap = {
        noLandingPage:{
          landingPage: 'noLandingPage',
          advertiser: 'General Advertiser',
          publisher: 'General Publisher',
          campaign: 'General Campaign',
          uniqueKey: 'uniqueKey',
          pageViews: 0,
          clicks: 0,
          phones: 0,
          convertedPhones: 0
          }
        };
        for(var i = 0; i < self.pages.length; i++){
          var pageItem = self.pages[i];
          if(gridMap[pageItem.landingPage]){
            gridMap[pageItem.landingPage].pageViews += 1;
          } else {
            gridMap[pageItem.landingPage] = {
                landingPage: pageItem.landingPage,
                advertiser: pageItem.advertiserName + ' (' + pageItem.advertiserId + ')',
                publisher: pageItem.publisherName + ' (' + pageItem.publisherId + ')',
                campaign: pageItem.campaignName + ' (' + pageItem.campaignId + ')',
                uniqueKey: pageItem.advertiserId + '-' + pageItem.publisherId + '-' + pageItem.campaignId,
                pageViews: 1,
                clicks: 0,
                phones: 0,
                convertedPhones: 0
              };
            self.uniqueKeyMap[gridMap[pageItem.landingPage].uniqueKey] = pageItem.landingPage;
          }
        }

        for(var i = 0; i < self.clicks.length; i++){
          var clickItem = self.clicks[i];
          if(gridMap[clickItem.landingPage]){
            gridMap[clickItem.landingPage].clicks += 1;
          } else {
            gridMap[pageItem.landingPage] = {
                landingPage: clickItem.landingPage,
                advertiser: clickItem.advertiserName + ' (' + clickItem.advertiserId + ')',
                publisher: clickItem.publisherName + ' (' + clickItem.publisherId + ')',
                campaign: clickItem.campaignName + ' (' + clickItem.campaignId + ')',
                uniqueKey: pageItem.advertiserId + '-' + pageItem.publisherId + '-' + pageItem.campaignId,
                pageViews: 0,
                clicks: 1,
                phones: 0,
                convertedPhones: 0
              };
              self.uniqueKeyMap[gridMap[pageItem.landingPage].uniqueKey] = pageItem.landingPage;
          }
        }

        for(var i = 0; i < self.phones.length; i++){
          var phoneItem = self.phones[i];
          var uniqueKey = phoneItem.advertiserId + '-' + phoneItem.publisherId + '-' + phoneItem.campaignId;
          var lp = self.uniqueKeyMap[uniqueKey];
          if(!!lp){
            gridMap[lp].phones += 1;
            if(phoneItem.margin !== '0.00') gridMap[lp].convertedPhones += 1;
          } else {
            gridMap['noLandingPage'].phones += 1;
            if(phoneItem.margin !== '0.00') gridMap['noLandingPage'].convertedPhones += 1;
          }
        }

        var lpKeys = Object.keys(gridMap);
        lpKeys.forEach(function(key){
          gridData.push(gridMap[key]);
        });
    }
  }
})(angular);
