angular.module('openit.controllers', [])


.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})


.directive("search", function() {
    return {
        restrict: "E",
        transclude: true,
        scope: {
            title: "@"
        },
        template: '<div>\n  <h3 ng-click="toggleContent()">{{title}}</h3>\n \
          <div ng-show="isContentVisible" ng-transclude></div>\n<div>',
        link: function(scope) {
            scope.isContentVisible = false;

            scope.toggleContent = function() {
                scope.isContentVisible = !scope.isContentVisible;
            }
        }
    }
})


.controller('MainListCtrl', function($scope , $stateParams, $http ) {
  
  /*intial load*/
  if ( License_status.length == 0 )
  {
    VERBOSE("License_status length is empty force update...");
    var dataurl = getServerUrl();
    VERBOSE("Retrieving data from " + dataurl );
    $http.get( dataurl ).then( function (resp){
      VERBOSE( 'Success' , resp );
      var xmldoc = parseXML( resp.data );
      parseLicenseStatus(xmldoc);
      prepareListing();
    }, function( err ) {
      ERROR('Failed to retrieved data');
    });
  }
  
  $scope.category = capitaliseFirstLetter( $stateParams.category.substring(1) );
  var id = $stateParams.id.substring(1);
  prepareListing();
  
  /*Functions goes here*/

  function prepareListing (){
      var features = [];
      
      if ( $scope.category.toLowerCase() == 'products')
        $scope.listing = License_status;
      else if ( $scope.category.toLowerCase() == 'features')
      {
        for (i =0; i !=License_status.length; i++)
        {
            License_status[i].features.forEach(function( entry ){
              features.push( entry );
            });  
        }
        $scope.listing = features;
      }
    
  }
  /*scope functions here*/
  $scope.productListRefresh = function(){
    VERBOSE("Refreshing xml data via list drag");
    var dataurl = getServerUrl();
    VERBOSE("Retrieving data from " + dataurl );
    $http.get( dataurl).then( function (resp){
      VERBOSE( 'Success' , resp );
      var xmldoc = parseXML( resp.data );
      parseLicenseStatus(xmldoc);
      prepareListing();
      $scope.$broadcast('scroll.refreshComplete');
    }, function( err ) {
      showError(' Error' ,err );

    })
  }

 
  
})

.controller('SubListCtrl', function($scope, $stateParams , $http ) {

   $scope.refreshXMLData = function(){
    VERBOSE("Refreshing xml data");
    var dataurl = getServerUrl();
     VERBOSE("Retrieving data from " + dataurl );
    $http.get( dataurl ).then( function (resp){
      VERBOSE( 'Success' , resp );
      var xmldoc = parseXML( resp.data );
      License_status = parseLicenseStatus(xmldoc);
      $scope.$broadcast('scroll.refreshComplete');
    }, function( err ) {
      showError(' Error' ,err );

    })
  }
  
  var id = $stateParams.id.substring(1);
  $scope.id = id;
  $scope.category = $stateParams.category.substring(1);
  $scope.productname = License_status[$scope.id].productname;
  $scope.features = License_status[$scope.id].features; 

});
