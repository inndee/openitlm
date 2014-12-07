angular.module('openit.controllers', [])

.factory('Data', function () {
  return { message: "I'm data from a service" };
})

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


.controller('MainListCtrl', function($scope , $stateParams, $http , $ionicModal ) {
   
  /*intial load*/

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  

  $scope.category = capitaliseFirstLetter( $stateParams.category.substring(1) );
  var id = $stateParams.id.substring(1);

  if ( LicenseStatus.length == 0 )
  { 
    VERBOSE("License_status length is empty force update...");
    var dataurl = getServerUrl();
    VERBOSE("Retrieving data from " + dataurl );
    $http.get( dataurl ).then(
      function (resp)
      {
        VERBOSE( 'Success' , resp ); 
        LicenseStatus = convertToJson( resp.data );
        prepareDataListing();
        if ( LicenseStatus.length != 0 && LicenseStatus.realtime != null )
          $scope.listing = prepareData();
        
      },

     function( err ) {
      ERROR('Failed to retrieved data');
      $scope.$broadcast('scroll.refreshComplete');
    });
  }


    if ( LicenseStatus.length != 0 )
     $scope.listing = prepareData();
  
  /*Functions goes here*/

 

  function prepareData ()
  {
      
      DEBUG("Preparing data....");
      prepareDataListing();
      
      if ( LicenseStatus == undefined  )
        return;
        
      var listing = [];
      
      if ( $scope.category.toLowerCase() == 'products')
        listing = LicenseStatus.realtime.productlist;
      else if ( $scope.category.toLowerCase() == 'features')
        listing = LicenseStatus.realtime.featureslist;
      else if ( $scope.category.toLowerCase() == 'users')
        listing = LicenseStatus.realtime.userslist;
      
      return listing;
  }
  
 

  /*scope functions here*/
  

  $scope.productListRefresh = function(){
    
    var success = false;
    VERBOSE("updating license status via list drag.");
    var dataurl = getServerUrl();
    VERBOSE("Retrieving data from " + dataurl );
    $http.get( dataurl ).then( function (resp) {
        VERBOSE( 'Success' , resp ); 
        LicenseStatus = convertToJson( resp.data );
        if ( LicenseStatus.length != 0 )
          $scope.listing = prepareData();
      }, function( err ) {
        showError('Connection error', 'Failed to retrieve license status data. Please check your server configurations or mobile data settings.'); 
      }   
    )
    $scope.$broadcast('scroll.refreshComplete');
    
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
  };
  


});
