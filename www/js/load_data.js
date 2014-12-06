var ServerUrl = "http://devcola.com/public_data/loadxml.php";
//var ServerUrl ="http://mnl242lin:8080/OpeniT/loadxml.php";

var LicenseStatus = [];

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
	if ( LicenseStatus.length == 0 )
	{
		ERROR('prepareDataForListing:Failed to prepare data LicenseStatus is empty');
		return;
	}
	/*summarized totallicenses and in use for products*/

	DEBUG('Preparing Product data...');
	for ( i = 0 ; i !=LicenseStatus.realtime.vendorlicenses.vendorlicense.length ; i++ )
	{
		var vlicense = LicenseStatus.realtime.vendorlicenses.vendorlicense[i];
		var totallicenses = 0;
		var totaluse = 0;

		/*get all features , totallicenses and  total in use*/
		vlicense.daemons.daemon.features.feature.forEach( function ( feature ) {
			totallicenses += parseInt (feature.licenses);
			totaluse += parseInt (feature.used);
		});
		 
		
		LicenseStatus.realtime.vendorlicenses.vendorlicense[i]["id"] = i;
		LicenseStatus.realtime.vendorlicenses.vendorlicense[i]["totallicenses"] = totallicenses;
		LicenseStatus.realtime.vendorlicenses.vendorlicense[i]["inuse"] = totaluse;


		var htmlformat = formatHTMLProductItem( LicenseStatus.realtime.vendorlicenses.vendorlicense[i] );
		LicenseStatus.realtime.vendorlicenses.vendorlicense[i]["html"] = htmlformat;

	}

	DEBUG ('Preparing Feature data');
	var all_features = [];
	for ( i = 0 ; i !=LicenseStatus.realtime.vendorlicenses.vendorlicense.length ; i++ )
	{
		var vlicense = LicenseStatus.realtime.vendorlicenses.vendorlicense[i];
		var id = 0;
		vlicense.daemons.daemon.features.feature.forEach( function ( feature ) {
			feature["id"] = id;
			feature["productname"] = vlicense.name;
			feature["daemon_name"] = vlicense.daemons.daemon.name;
			feature["daemon_status"] = vlicense.daemons.daemon.status;
			feature["daemon_version"] = vlicense.daemons.daemon.version;
			feature["html"] = formatHTMLFeatureItem( feature );
			all_features.push( feature );
			id++;
		});
		
	}
	
	LicenseStatus.realtime["featureslist"] = all_features;

	DEBUG("Preparing users list");
	var all_users = [];
	
	for ( i = 0 ; i !=all_features.length ; i++ )
	{
		if (all_features[i].online == null)
			continue;
		var productname = all_features[i].productname; 
		var featurename = all_features[i].name; 
		
		/*get entries*/
		var entries = all_features[i].online.entry;
		if ( entries.constructor != Array)
		{
			entries["productname"] = productname;
			entries["featurename"] = featurename;
			all_users.push ( entries );
		}
		else
		{
			entries.forEach( function(entry){
				entry["productname"] = productname;
				entry["featurename"] = featurename;
				all_users.push ( entry );
			});
		}
		

	}

	var uniqueUsers = removeDuplicatesInArray(all_users);
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

function removeDuplicatesInArray( array_data )
{
	var uniqueArray = array_data.filter(function(elem, pos) {
    	return array_data.indexOf(elem) == pos;
  	}); 
  	return uniqueArray;
}








