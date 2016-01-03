'use strict';

/**
 * @ngdoc function
 * @name goojibearApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the goojibearApp
 */
(function(){
  angular.module('goojibearApp').controller('dataManagementCtrl', DataManagementCtrl);

  DataManagementCtrl.$inject = ['$scope', '$window', '$http', '$q'];

  function DataManagementCtrl($scope, $window, $http, $q) {
    var self = this;



    self.aggregateData = function(serviceName, queryField, year, month, day, aggregationField){
      var d = new Date(year, month, day);
      var startVal = Date.UTC(d.getUTCFullYear(),
                               d.getUTCMonth(),
                               d.getUTCDate(),
                               d.getUTCHours(),
                               d.getUTCMinutes(),
                               d.getUTCSeconds(),
                               d.getUTCMilliseconds());
      d.setDate(d.getDate() + 1);
      var endVal = Date.UTC(d.getUTCFullYear(),
                             d.getUTCMonth(),
                             d.getUTCDate(),
                             d.getUTCHours(),
                             d.getUTCMinutes(),
                             d.getUTCSeconds(),
                             d.getUTCMilliseconds());


      var filter = {};
      filter['$where'] = 'this.' + queryField + ' > '  + startVal + ' && this.' + queryField + ' < ' + endVal;

      $http({
        method: 'POST',
        url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/queryService/' + serviceName,
        data: filter
      }).then(function(result){
        var aggregatedMap = {};
        var items = result.data;
        items.forEach(function(item){
          var uniqueCombo = self.generateUniqueCombo(item);
          if(!aggregatedMap[uniqueCombo]){
            aggregatedMap[uniqueCombo] = {
              utcTimestamp: startVal,
              uniqueCombo: uniqueCombo,
              advertiser: item.advertiserName + ' (' + item.advertiserId + ')',
              publisher: item.publisherName + ' (' + item.publisherId + ')',
              campaign: item.campaignName + ' (' + item.campaignId + ')'
            };
            aggregatedMap[uniqueCombo][aggregationField] = 1
          } else {
            aggregatedMap[uniqueCombo][aggregationField] += 1;
          }
        });
        console.log(aggregatedMap);
        var keys = Object.keys(aggregatedMap);
        keys.forEach(function(key){
          $http({
            method: 'POST',
            url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/' + serviceName + 'Aggregated',
            data: aggregatedMap[key]
          })
        });
      }, function(error){
        console.log(error);
      });
    }

    self.fixData = function(serviceName, queryCondition, fixObj){
    //fixData('clickTracking', {"advertiserName": "Prestige Marketing", "advertiserID": 1234}, [{name: "advertiserId", value: 5678}]);
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

    self.generateUniqueCombo = function(item){
      return item.advertiserId + '-' + item.publisherId + '-' + item.campaignId;
    }

//    for(var i = 1; i < 31; i++){
//      self.aggregateData('pageTracking', 'utcTimestamp', 2015, 11, i, 'totalViews');
//    }

  }
})(angular);
