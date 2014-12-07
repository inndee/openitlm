var ServerUrl = "http://devcola.com/public_data/loadxml.php";
//var ServerUrl ="http://mnl242lin:8080/OpeniT/loadxml.ph1p";
//var ServerUrl ="http://127.0.0.1:8100/loadxml.php";

var LicenseStatus = [];

/**/
function getArraySubObjects (data)
{
	if (data.constructor != Array )
	{
		var temp = [];
		temp.push (data)
		return temp
	}
	else
		return data;
		
}

/*-------------------Getters----------------*/

function getServerUrl ()
{
	/*Prevent cache*/
	var randomNum = Math.round(Math.random() * 10000);
	return ServerUrl + "?rand=" + randomNum;
}

/*-------------------Formatting----------------*/

/*return epoch time(milliseconds) to string readable*/
function epochToDate( epoch ) 
{
	epoch = parseFloat( epoch ) * 1000;
	var dateVal ="/Date("+ epoch +")/";
	var date = new Date( parseFloat( dateVal.substr(6 )));

	return date.toLocaleString();

}

function capitaliseFirstLetter(string){ return string.charAt(0).toUpperCase() + string.slice(1); }

function parseXML( xml_string )
{
	var xmldoc;
	if (window.DOMParser)
	{
		parser=new DOMParser();
		xmldoc=parser.parseFromString( xml_string,"text/xml");
		console.log( "Verbose: parsing xml data.");
	}
	else // Internet Explorer
	{
		xmldoc=new ActiveXObject("Microsoft.XMLDOM");
		xmldoc.async=false;
		xmldoc.loadXML( xml_string );
	}
	return xmldoc;
}

function convertToJson( xml )
{
	var json = parseXML ( xml );
	return JSON.parse( xml2json(json,'	') );
}



function prepareDataListing()
{
	if ( LicenseStatus.length == 0  || LicenseStatus.realtime == null )
	{
		ERROR('prepareDataForListing:Failed to prepare data LicenseStatus is empty');
		return false;
	}
	
	/*summarized totallicenses and in use for products*/

	DEBUG('Preparing Product data...');
	var all_products = [];
	getArraySubObjects( LicenseStatus.realtime.vendorlicenses.vendorlicense ).forEach (function ( vlicense ){
		var totallicenses = 0;
		var totaluse = 0;
		
		/*get totallicenses and inuse*/
		getArraySubObjects( vlicense.daemons.daemon.features.feature).forEach( function (feature){
			totallicenses += parseInt (feature.licenses);
			totaluse += parseInt (feature.used);
		});

		vlicense["totallicenses"] = totallicenses;
		vlicense["inuse"] = totaluse;
		vlicense["html"] = formatHTMLProductItem( vlicense ); 
		all_products.push ( vlicense );
	});
	
	LicenseStatus.realtime["productlist"] = all_products;

	DEBUG ('Preparing Feature data');
	var all_features = [];
	getArraySubObjects( LicenseStatus.realtime.vendorlicenses.vendorlicense ).forEach (function ( vlicense ){
		
		getArraySubObjects( vlicense.daemons.daemon.features.feature).forEach( function (feature){
			feature["productname"] = vlicense.name;
			feature["daemon_name"] = vlicense.daemons.daemon.name;
			feature["daemon_status"] = vlicense.daemons.daemon.status;
			feature["daemon_version"] = vlicense.daemons.daemon.version;
			feature["html"] = formatHTMLFeatureItem( feature );
			all_features.push( feature );
		});

	});
	
	LicenseStatus.realtime["featureslist"] = all_features;


	
	DEBUG("Preparing users list");
	
	var all_usage = [];
	getArraySubObjects( all_features ).forEach( function (feature){
		
		if (feature.online == null)
			return;
			
		
		getArraySubObjects( feature.online.entry ).forEach ( function (entry) {
			entry["productname"] = feature.productname;
			entry["featurename"] = feature.name;
			all_usage.push ( entry );
		});
	});



	
	
	/*get the list of uniqueusers*/
	var uniqueusers = [];
	getArraySubObjects( all_usage ).forEach ( function (entry) { 
		uniqueusers.push (entry.user);
	});

	uniqueusers = removeDuplicatesInArray(uniqueusers);
	var users_usage =[];
	getArraySubObjects( uniqueusers ).forEach ( function (user) {
		var usage = [];
		getArraySubObjects(all_usage).forEach (function (entry){
			if (user == entry.user)
				usage.push( entry );
		});

		var htmlitem = formatHTMLUserItem ( user , usage ); 
		users_usage.push( { name : user , use : usage, html : htmlitem });
		
	});
	

	LicenseStatus.realtime["userslist"] = users_usage;
}

function formatHTMLProductItem( data )
{
	var header = "<h3>" + data.name + "</h3>";
	var usage_meter = "";

	var percentage = parseInt( (data.inuse/data.totallicenses) * 100 );
	
	if ( percentage != 0 )
		usage_meter = "<hr align='left' width='" + percentage + "%' />"; 
	
	var details = "";
	
	
	details += "<p class='inline' >Total Licenses: " + data.totallicenses + "</p>   " +
			   "<p class='inline'>In Use Licenses: " + data.inuse + "</p>";

	var meterbar =	"<br/><br/><br/>" +
					"<div class='meterbar'>" + 
						usage_meter +
			  		"</div>";
	var item = header + details + meterbar;
	return item;

}

function formatHTMLFeatureItem( data )
{
	var header = "<h3>" + data.name +" </h3>";

	var usage_meter = "";

	var percentage = parseInt( (data.used/data.licenses) * 100 );
	
	if ( percentage != 0 )
		usage_meter = "<hr align='left' width='" + percentage + "%' />"; 
	
	var details = "";
	details += "<p>Version: " + data.version + "</p></br/><br/>";
	details += "<p>Product name: " + data.productname + "</p>";
	details += "<p>Expires: " + epochToDate( data.expires )+ "</p>";
	
	details += "<h4 class='inline'>Total Licenses: " + data.licenses + "</h4>   " +
			   "<h4 class = 'inline'>In Use Licenses: " + data.used + "</h4>";

	var meterbar =	"<br/><br/>" +
					"<div class='meterbar'>" + 
						usage_meter +
			  		"</div>";
	
	var item = header + details + meterbar;
	return item;

}

function formatHTMLUserItem ( user, usage )
{
	var header = "<h3>" + user +" </h3>";
	var details = "<h4>Use licenses: " + usage.length + "</h4>"
	var item = header + details;
	return item;
}

function removeDuplicatesInArray( array_data )
{
	var uniqueArray = array_data.filter(function(elem, pos) {
    	return array_data.indexOf(elem) == pos;
  	}); 
  	return uniqueArray;
}








