angular.module('openit.controllers', [])

.factory('Data', function() {
    return {
        defaultLimit: 20
    };
})

.factory('Configurations', function() {
    return {
        message: "I'm data from a service",
        defaultlimit: 20,
        defaultdelay : 500,
        server_url : getServerUrl(),
    };
})
.factory('HtmlMessages', function() {
    return {
        no_usage        : "<h3 align='center'><i class='icon button-icon icon ion-information-circled'></i> <br/> <br/> Looks like there is no usage here....</h3>",
        warning         : "<h3 align='center'><i class='icon button-icon icon ion-load-c spin'></i></i>Warning</h3>",
        loading_message : "<h3 align='center'><i class='icon button-icon icon ion-load-c spin'></i></i>Updating license status</h3>",
        custom_message  : function ( type , message ){
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


.controller('MainListCtrl', function($scope, $rootScope, $stateParams, $http , $timeout,HtmlMessages , Configurations) {

    DEBUG('Loading MainListCtrl');
    $scope.validateLimit = function () {
        console.log('tetst');
        
        if ( $scope.defaultlimit > 99999 )
            $scope.defaultlimit = 20;

        if ( isNaN( $scope.defaultlimit) )
            $scope.defaultlimit = 20;
        else if ($scope.defaultlimit  == 0 )
            $scope.defaultlimit = 20;
        
    };
    /*this will be the next page*/
    $scope.page = 'sublist';
    
    /*initialize page*/
    $scope.defaultlimit = Configurations.defaultlimit;
    $scope.category_title = capitaliseFirstLetter( $stateParams.category.substring(1) );
    $scope.category =  $stateParams.category.substring(1);
    $scope.search = "";
    
    /*intial load*/
    if (LicenseStatus.length == 0) {
        $scope.message = HtmlMessages.loading_message;
        VERBOSE("Retrieving data from " + Configurations.server_url);
        $http.get( Configurations.server_url).then(function(resp) {
            VERBOSE('Success', resp);
             $scope.message = HtmlMessages.loading_message;
             $rootScope.listing = [];
            LicenseStatus = convertToJson(resp.data);
            if (LicenseStatus.length != 0 && LicenseStatus.realtime != null) 
                prepareData();

            $timeout(function() {
                
                $rootScope.listing = prepareList();
                $scope.message = "";
            }, Configurations.defaultdelay );

            $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);
        }, function(err) {
            showError('Connection error', 'Failed to retrieve license status data. Please check your server configurations or mobile data settings.');
        })
        
        $scope.$broadcast('scroll.refreshComplete');
    }
    else if (LicenseStatus.length != 0)
        $rootScope.listing = prepareList();

     /*scope functions here*/


    $scope.refreshListing = function() {
         
       
        VERBOSE("Retrieving data from " + Configurations.server_url);
        $rootScope.listing = [];
        
        
        $http.get( Configurations.server_url).then(function(resp) {
            VERBOSE('Success', resp);
            $scope.message = HtmlMessages.loading_message;          
            LicenseStatus = convertToJson(resp.data);
            if (LicenseStatus.length != 0 && LicenseStatus.realtime != null) 
                prepareData(); 
          
            $timeout(function() {
                $scope.message = "";
                $rootScope.listing = prepareList();
                
                
            }, Configurations.defaultdelay);

            $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);
        }, function(err) {
            showError('Connection error', 'Failed to retrieve license status data. Please check your server configurations or mobile data settings.');
        })
        $scope.message = [];
        $scope.$broadcast('scroll.refreshComplete');

    }
    
    function prepareList() {

        if (LicenseStatus == undefined)
            return;
        
        if ($scope.category.toLowerCase() == 'product') {
            return  LicenseStatus.realtime.productlist;
        } else if ($scope.category.toLowerCase() == 'feature') {
           return LicenseStatus.realtime.featureslist;
        } else if ($scope.category.toLowerCase() == 'user') {
            return LicenseStatus.realtime.userslist;
        }

        return false;
    }



   




})

.controller('SubListCtrl', function($scope, $stateParams, $http, $rootScope ,$timeout , Configurations, HtmlMessages) {
    
    DEBUG('Loading SubListCtrl');
    
    $scope.validateLimit = function () {
        console.log('tetst');
        
        if ( $scope.defaultlimit > 99999 )
            $scope.defaultlimit = 20;

        if ( isNaN( $scope.defaultlimit) )
            $scope.defaultlimit = 20;
        else if ($scope.defaultlimit  == 0 )
            $scope.defaultlimit = 20;
        
    };
 
    $scope.defaultlimit = Configurations.defaultlimit;
    $scope.search = "";
    
    /*intial load*/
    if (LicenseStatus.length == 0) 
    {
        DEBUG('LicenseStatus empty force updating...');
        VERBOSE("Retrieving data from " + Configurations.server_url);
        $http.get( Configurations.server_url).then(function(resp) {
            VERBOSE('Success', resp);
             $scope.message = HtmlMessages.loading_message;
             $rootScope.listing = [];
            LicenseStatus = convertToJson(resp.data);
            if (LicenseStatus.length != 0 && LicenseStatus.realtime != null) 
                prepareData();
 
            $timeout(function() {
                $scope.message = "";
                $rootScope.listing = prepareList();
            }, Configurations.defaultdelay );

            $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);
        }, function(err) {
            showError('Connection error', 'Failed to retrieve license status data. Please check your server configurations or mobile data settings.');
        })
        
        $scope.$broadcast('scroll.refreshComplete');
    }
    else if (LicenseStatus.length != 0)
        $rootScope.listing = prepareList();
        
    $scope.refreshListing = function() {
         
       
        VERBOSE("Retrieving data from " + Configurations.server_url);
        $rootScope.listing = [];
        
        $http.get( Configurations.server_url).then(function(resp) {
            VERBOSE('Success', resp);
            $scope.message = HtmlMessages.loading_message;          
            LicenseStatus = convertToJson(resp.data);
            if (LicenseStatus.length != 0 && LicenseStatus.realtime != null) 
                prepareData(); 
 
            $timeout(function() {
                $scope.message = "";
                $rootScope.listing = prepareList();
            }, Configurations.defaultdelay);

            $rootScope.collectiontime = epochToDate(LicenseStatus.realtime.meta.content);
        }, function(err) {
            showError('Connection error', 'Failed to retrieve license status data. Please check your server configurations or mobile data settings.');
        })
        $scope.message = [];
        $scope.$broadcast('scroll.refreshComplete');

    }
    
    function prepareList()
    {
        var list =[];
        $rootScope.listing = [];
        if ( $stateParams.category.substring(1) == 'product')
        {
            var vlicense = LicenseStatus.realtime.vendorlicenses.vendorlicense[$stateParams.id.substring(1)];
            $scope.category_title = vlicense.name;
            
            getArraySubObjects(vlicense.daemons.daemon.features.feature).forEach( function (feature){
                var link = "";
                if (feature.online != null)
                    link = "#/app/sublist/:feature/:" +feature.id ; 
                    
                var htmlitem = formatHTMLFeatureItem( feature );
                feature['link'] = link;
                feature['html'] =htmlitem;
                list.push( feature );
            });
        }
        else if ( $stateParams.category.substring(1) == 'feature')
        {
            var feature = LicenseStatus.realtime.featureslist[$stateParams.id.substring(1)];
            $scope.category_title = feature.name;
            
            getArraySubObjects(feature.online.entry).forEach( function (entry){
                var link = "#/app/sublist/:user/:" + entry.user ; 
                /*list entries*/
                var htmlitem = "<h3><img src='graphics/user-icon-sm.png' width='20px'>" + entry.user + "</h3> <br/>"
                htmlitem += "<p>Host: " + entry.host + "</p>";
                htmlitem += "<p style='padding-right:10px;'>Count: " + ( entry.count ) + "</p>";
                htmlitem += "<p style='padding-right:10px;'>Checkout time: " + epochToDate( entry.start ) + "</p>";
                htmlitem += "<p>Running Time:</p><p>" + getUsageIntervals( entry.start ) + "</p>";
                
                list.push( {'name' : entry.user, 'link' : link , 'html' : htmlitem } );
            });
        }
        else if ( $stateParams.category.substring(1) == 'user')
        {
                $scope.category_title = $stateParams.id.substring(1);
                getArraySubObjects( LicenseStatus.realtime.userslist ).forEach( function (user) {
                 if ( user.name == $stateParams.id.substring(1) )
                 {
                     getArraySubObjects( user.use ).forEach( function ( usage )
                     {
                         usage;
                         var link="";
                         var htmlitem = "<h3>Product name: " + usage.productname + "</h3>";
                         htmlitem += "<h4>Feature name: " + usage.featurename + "</h4>";
                         htmlitem += "<p>Count: " + usage.count + "</p>";
                    
                         htmlitem += "<p>Running time: " + getUsageIntervals( usage.start ) + "</p>";
                         list.push ( {'name': usage.featurename ,'link' : link, 'html' :htmlitem } );

                     });
                     
                 }
             });
        }
        return list;
    }


});