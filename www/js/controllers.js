angular.module('openit.controllers', [])

.factory('Data', function() {
    return {
        message: "I'm data from a service"
    };
})

.factory('Configurations', function() {
    return {
        message: "I'm data from a service"
    };
})
.factory('HtmlMessages', function() {
    return {
                    no_usage : "<h3 align='center'><i class='icon button-icon icon ion-information-circled'></i> <br/> <br/> Looks like there is no usage here....</h3>",
                    warning : "<h3 align='center'><i class='icon button-icon icon ion-load-c spin'></i></i>Warning</h3>",
                    loading_message : "<h3 align='center'><i class='icon button-icon icon ion-load-c spin'></i></i>Updating license status</h3>",
                    custom_message : function ( type , message ){
                        
                    
                 }
    };
})



.controller('AppCtrl', function($scope, $ionicModal, $rootScope, $stateParams, $http, $timeout, $location) {
    // Form data for the login modal

    var loading_message = "<h3 align='center'><i class='icon button-icon icon ion-load-c spin'></i></i>Updating license status</h3>";
    $scope.server = {};



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
        console.log('Login in to server', $scope.server);

        var dataurl = getServerUrl();
        $http.get(dataurl).then(
            function(resp) {
                VERBOSE('Success', resp);
                LicenseStatus = convertToJson(resp.data);
                prepareDataListing();
                if (LicenseStatus.length != 0 && LicenseStatus.realtime != null)
                    $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);

            },

            function(err) {
                ERROR('Failed to retrieved data');
            });
        $scope.closeLogin();

        //$ionicViewService.clearHistory();
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        //$timeout(function() {
        //  $scope.closeLogin();
        //}, 1000);
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


.controller('MainListCtrl', function($scope, $rootScope, $stateParams, $http ,HtmlMessages ) {


    
    /*intial load*/
    $scope.defaultlimit = 20;
    $scope.category = capitaliseFirstLetter($stateParams.category.substring(1));
    var id = $stateParams.id.substring(1);

    if (LicenseStatus.length == 0) {

        $rootScope.listing = [];
        $rootScope.listing.push({
            html: HtmlMessages.loading_message
        });
        VERBOSE("License_status length is empty force update...");
        var dataurl = getServerUrl();
        VERBOSE("Retrieving data from " + dataurl);
        $http.get(dataurl).then(
            function(resp) {
                VERBOSE('Success', resp);
                LicenseStatus = convertToJson(resp.data);
                prepareDataListing();
                if (LicenseStatus.length != 0 && LicenseStatus.realtime != null)
                    $rootScope.listing = prepareData();
                $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);

            },

            function(err) {
                ERROR('Failed to retrieved data');
                $scope.$broadcast('scroll.refreshComplete');
            });
    }


    if (LicenseStatus.length != 0)
        $rootScope.listing = prepareData();

    /*Functions goes here*/



    function prepareData() {

        if (LicenseStatus == undefined)
            return;

        var listing = [];

        if ($scope.category.toLowerCase() == 'products') {
            listing = LicenseStatus.realtime.productlist;
            listing["category"] = 'product';
        } else if ($scope.category.toLowerCase() == 'features') {
            listing = LicenseStatus.realtime.featureslist;
            listing["category"] = 'feature';
        } else if ($scope.category.toLowerCase() == 'users') {
            listing = LicenseStatus.realtime.userslist;
            listing["category"] = 'user';
        }


        return listing;
    }



    /*scope functions here*/


    $scope.refreshListing = function() {

        var success = false;
        $rootScope.listing = [];
        $rootScope.listing.push({
            html:  HtmlMessages.loading_message
        });
        $scope.search = "";
        VERBOSE("updating license status via list drag.");
        var dataurl = getServerUrl();
        VERBOSE("Retrieving data from " + dataurl);
        $http.get(dataurl).then(function(resp) {
            VERBOSE('Success', resp);

            LicenseStatus = convertToJson(resp.data);
            if (LicenseStatus.length != 0 && LicenseStatus.realtime != null) {
                prepareDataListing();
                $rootScope.listing = prepareData();
            }

            $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);
        }, function(err) {
            showError('Connection error', 'Failed to retrieve license status data. Please check your server configurations or mobile data settings.');
        })


        $scope.$broadcast('scroll.refreshComplete');

    }




})

.controller('SubListCtrl', function($scope, $stateParams, $http, $rootScope , HtmlMessages) {


    $scope.defaultlimit = 20;
   
    if (LicenseStatus.length == 0) {
        $rootScope.listing = [];
        $rootScope.listing.push({
            html: HtmlMessages.loading_message
        });
        VERBOSE("License_status length is empty force update...");
        var dataurl = getServerUrl();
        VERBOSE("Retrieving data from " + dataurl);
        $http.get(dataurl).then(
            function(resp) {
                VERBOSE('Success', resp);
                LicenseStatus = convertToJson(resp.data);
                prepareDataListing();
                prepareData();
                $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);


            },

            function(err) {
                ERROR('Failed to retrieved data');
                $scope.$broadcast('scroll.refreshComplete');
            });
    }


    $scope.category = $stateParams.category.substring(1);
    $scope.id = $stateParams.id.substring(1);
    if (LicenseStatus.length != 0) {
        prepareData();
        $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);
    }



    function prepareData() {

        /*list down features under this product*/
        if ($scope.category == 'product') {
            var featureslist = [];
            vlicense = LicenseStatus.realtime.vendorlicenses.vendorlicense[$scope.id];
            $scope.headeritem = vlicense;
            LicenseStatus.realtime.featureslist.forEach(function(feature) {
                if (vlicense.name == feature.productname)
                    featureslist.push(feature);
            });
            $rootScope.listing = featureslist;
            $scope.category = 'feature';

        } else if ($scope.category == 'feature') {
            $scope.headeritem = LicenseStatus.realtime.featureslist[$scope.id];
            
            if ( LicenseStatus.realtime.featureslist[$scope.id].online == null )
            {
                $rootScope.listing  = [];
                $rootScope.listing.push( { html: HtmlMessages.no_usage } );
            }
                
            else
            {

                /*create sub list of users*/
                var entries = LicenseStatus.realtime.featureslist[$scope.id].online.entry;
                getArraySubObjects( entries ).forEach ( function (entry){
                    var htmlitem = "<h3>" + entry.user + "</h3>"
                    htmlitem += "<p>Host: " + entry.host + "</p><br/>";
                    htmlitem += "<p>" + getUsageIntervals( entry.start ) + "</p><br/>";
                    /*get how long user use the license*/
                    
                   
                });
                 $rootScope.listing  = [];
            }
            $scope.category = 'user';
            LicenseStatus.realtime.userslist
            
        }


    }

});