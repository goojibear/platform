'use strict';

/**
 * @ngdoc function
 * @name goojibearApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the goojibearApp
 */
(function(){
  angular.module('goojibearApp').controller('queryBuilderCtrl', QueryBuilderCtrl);

  QueryBuilderCtrl.$inject = ['$scope', '$window', '$http', '$q'];

  function QueryBuilderCtrl($scope, $window, $http, $q) {
    var self = this;
    self.scope = $scope;
    self.gridHeight = $window.innerHeight - 120 + 'px';
    self.uniqueKeyMap = {};
    self.gridDataItems = [];
    self.dataType = {val: {id: "postBacks", name: 'Post Backs'}};
    self.itemArray = [
        {id: "postBacks", name: 'Post Backs'},
        {id: "noPostBacks", name: 'Failed Post Backs'},
        {id: "clickTracking", name: 'Clicks'},
        {id: "pageTracking", name: 'Page Views'},
        {id: "phoneTracking", name: 'Invoca Webhooks'},
        {id: "logs", name: 'Logs'}
    ];

    self.columnDefs = {
      postBacks: [
        {field:'title', name: 'Title'},
        {field:'isConverted', name: 'Converted'},
        {field:'clickId', name: 'Click ID'},
        {field:'created_at', name: 'Created At'}
      ],
      noPostBacks: [
        {field:'advertiser', name: 'Advertiser'},
        {field:'campaign', name: 'Campaign'},
        {field:'publisher', name: 'Publisher'},
        {field:'region', name: 'Region'},
        {field:'city', name: 'City'},
        {field:'isConverted', name: 'Converted'},
        {field:'callStartTimeUTC', name: 'Call Start Time UTC'},
        {field:'created_at', name: 'Created At'}
      ],
       phoneTracking: [
         {field:'advertiser', name: 'Advertiser'},
         {field:'campaign', name: 'Campaign'},
         {field:'publisher', name: 'Publisher'},
         {field:'region', name: 'Region'},
         {field:'city', name: 'City'},
         {field:'isConverted', name: 'Converted'},
         {field:'callStartTimeUTC', name: 'Call Start Time UTC'},
         {field:'created_at', name: 'Created At'}
       ]
    }

    self.gridData = {
      data: self.gridDataItems,
      columnDefs: self.columnDefs[self.dataType.val.id],
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

      var clickPromise = $http({
        method: 'GET',
        url: 'http://ec2-54-201-60-244.us-west-2.compute.amazonaws.com/' + self.dataType.val.id
      }).then(function successCallback(response) {
        self.gridDataItems.length = 0;
        response.data.forEach(function(item){
          self.gridDataItems.push(item);
        });
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    self.dataTypeChanged = function(){
      self.gridData.columnDefs.legth = 0;
      self.gridData.columnDefs = self.columnDefs[self.dataType.val.id];
    };
  }
})(angular);
