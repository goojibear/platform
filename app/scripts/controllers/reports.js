'use strict';

/**
 * @ngdoc function
 * @name goojibearApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the goojibearApp
 */
(function(){
  angular.module('goojibearApp').controller('reportsCtrl', ReportsCtrl);

  ReportsCtrl.$inject = ['$scope', '$window', '$http', '$q'];

  function ReportsCtrl($scope, $window, $http, $q) {
    var self = this;
    self.scope = $scope;
    self.gridHeight = $window.innerHeight - 120 + 'px';
    self.uniqueKeyMap = {};
    self.gridDataItems = [];
    self.timeSpanType = {val: {id: 1, name: 'hours'}};
    self.itemArray = [
            {id: 1, name: 'hours'},
            {id: 2, name: 'days'}
        ];

    var columnDefs = [
      {field: 'uniqueCombo', name: 'Unique Key'},
      {field: 'advertiser', name: 'Advertiser Name'},
      {field: 'publisher', name: 'Publisher Name'},
      {field: 'campaign', name: 'Campaign Name'},
      {field: 'pageViews', name: 'Views (#)', type: 'number'},
      {field: 'clicks', name: 'Clicks (#)', type: 'number'},
      {field: 'phones', name: 'Calls (#)', type: 'number'},
      {field: 'convertedPhones', name: 'Conversions (#)', type: 'number'},
      {field: 'clicksPerViews', name: 'Clicks per Views (%)', type: 'number'},
      {field: 'conversionsPerPhones', name: 'Conversions per Calls (%)', type: 'number'}
    ];

    self.gridData = {
      data: self.gridDataItems,
      columnDefs: columnDefs,
      enableRowSelection: true,
      enableScrollbars: true,
      enableRowHeaderSelection: false,
      multiSelect: false,
      enableGridMenu: true,
      enableSelectAll: true,
      exporterCsvFilename: 'myFile.csv',
      exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
      onRegisterApi: function (gridApi) {
        self.gridApi = gridApi;
      }
    };

    self.getData = function(){
     var timeSpan = parseInt($('#txbTime').val());
     var now = new Date();
     // Set the time offset for pulling data
     if(self.timeSpanType.val.id === 1){
       now.setHours(now.getHours() - timeSpan);
     }else{
       now.setDate(now.getDate() - timeSpan);
     }

     var utcTimestamp = Date.UTC(now.getUTCFullYear(),
                                 now.getUTCMonth(),
                                 now.getUTCDate(),
                                 now.getUTCHours(),
                                 now.getUTCMinutes(),
                                 now.getUTCSeconds(),
                                 now.getUTCMilliseconds());

      var clickPromise = $http({
        method: 'POST',
        url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/queryService/clickTracking',
        data: {'utcTimestamp': {'$gt': utcTimestamp}}
      });
      var pagePromise = $http({
        method: 'POST',
        url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/queryService/pageTracking',
        data: {'utcTimestamp': {'$gt': utcTimestamp}}
      });
      var phonePromise = $http({
        method: 'POST',
        url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/queryService/phoneTracking',
        data: {'callStartTimeUTC': {'$gt': utcTimestamp}}
      });
      $q.all([clickPromise, pagePromise, phonePromise]).then(function successCallback(response) {
        self.clicks = response[0].data;
        self.pages = response[1].data;
        self.phones = response[2].data;
        prepareData(self);
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    function prepareData(){
      var gridMap = {};

      addItemToGridMap('pages', 'pageViews');
      addItemToGridMap('clicks', 'clicks');
      var unMatchedItems = addItemToGridMap('phones', 'phones');

      var noneExternalPublishers = [];
      var externalPublishers = {
        "268319": 268319, //DT Marketing
        "273624": 273624, //Soleo
        "274355": 274355, //Anuj Bhatia
        "271040": 271040, //Purple
        "273531": 273531 //Mobite Media
      };

      unMatchedItems.forEach(function(item){
        if(!!externalPublishers[item.publisherId]){
          var uniqueCombo = generateUniqueCombo(item);
          if(!gridMap[uniqueCombo]){
            gridMap[uniqueCombo] = {
              advertiser: item.advertiser + ' (' + item.advertiserId + ')',
              publisher: item.publisher + ' (' + item.publisherId + ')',
              campaign: item.campaign + ' (' + item.campaignId + ')',
              uniqueCombo: uniqueCombo,
              pageViews: 0,
              clicks: 0,
              phones: 0,
              convertedPhones: 0
            };
          }
          if(!!gridMap[uniqueCombo]) gridMap[uniqueCombo]['phones'] += 1;
        } else {
          noneExternalPublishers.push(item);
        }
      });

      var uniqueKeys = Object.keys(gridMap);
      self.gridDataItems.length = 0;
      uniqueKeys.forEach(function(key){
        gridMap[key].clicksPerViews = calcRatio(gridMap[key].clicks, gridMap[key].pageViews);
        gridMap[key].conversionsPerPhones = calcRatio(gridMap[key].convertedPhones, gridMap[key].phones);
        self.gridDataItems.push(gridMap[key]);
      });

      function addItemToGridMap(currentType, currentKey){
        var unMatchedItems = [];

        self[currentType].forEach(function(item){
          var uniqueCombo = generateUniqueCombo(item);
          if(!gridMap[uniqueCombo] && currentType !== 'phones'){
            gridMap[uniqueCombo] = {
              uniqueCombo: uniqueCombo,
              advertiser: item.advertiserName + ' (' + item.advertiserId + ')',
              publisher: item.publisherName + ' (' + item.publisherId + ')',
              campaign: item.campaignName + ' (' + item.campaignId + ')',
              uniqueCombo: uniqueCombo,
              pageViews: 0,
              clicks: 0,
              phones: 0,
              convertedPhones: 0
            };
          } else {
            unMatchedItems.push(item);
          }
          if(!!gridMap[uniqueCombo]) gridMap[uniqueCombo][currentKey] += 1;
        });

        return unMatchedItems;
      }

      function generateUniqueCombo(item){
        return item.advertiserId + '-' + item.publisherId + '-' + item.campaignId;
      }

      function calcRatio(a, b){
        if(b > 0){
          return parseFloat(a * 100 / b).toFixed(2);
        } else {
          return parseFloat(0).toFixed(2);
        }
      }

      console.log(gridMap, unMatchedItems, noneExternalPublishers);
    }

    //fixData('clickTracking', {"advertiserName": "Prestige Marketing", "advertiserID": 1234}, [{name: "advertiserId", value: 5678}]);
    function fixData(serviceName, queryCondition, fixObj){
      $http({
        method: 'POST',
        url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/queryService/' + serviceName,
        data: queryCondition
      }).then(
      function(result){
        var items = result.data;
        items.forEach(function(item){

          fixObj.forEach(function(obj){
            item[obj.name] = obj.value;
          });

          $http({
                method: 'PUT',
                url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/' + serviceName + '/' + item._id,
                data: item
              }).then(function(res){
              }, function(err){
                console.log(err);
              });
        });
      }, function(error){
          console.log(error);
      });
    }
  }
})(angular);
