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


.controller('PlaylistsCtrl', function($scope , $http ) {
  
  $scope.productlist = [];

  VERBOSE("Updating Productlist...");
  $http.get('http://devcola.com/public_data/loadxml.php').then( function (resp){
    VERBOSE( 'Success' , resp );
    var xmldoc = parseXML( resp.data );
    $scope.productlist = getProductList(xmldoc);
  }, function( err ) {
    showError(' Error' ,err );
  });

  $scope.productListRefresh = function(){
    VERBOSE("Refreshing xml data");
    $http.get('http://devcola.com/public_data/loadxml.php').then( function (resp){
      VERBOSE( 'Success' , resp );
      var xmldoc = parseXML( resp.data );
      $scope.productlist = getProductList(xmldoc);
      $scope.$broadcast('scroll.refreshComplete');
    }, function( err ) {
      showError(' Error' ,err );

    })
  }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {

});
