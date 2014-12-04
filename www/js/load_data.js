var ServerUrl = "http://devcola.com/public_data/loadxml.php";
//var ServerUrl ="http://mnl242lin:8080/OpeniT/loadxml.php";
var License_status = [];


/*return epoch time(milliseconds) to string readable*/
function epochToDate( epoch ) 
{
	epoch = parseFloat( epoch ) * 1000;
	var dateVal ="/Date("+ epoch +")/";
	var date = new Date( parseFloat( dateVal.substr(6 )));
	var date_str = 
		(date.getMonth() + 1) + "/" +
		date.getDate() + "/" +
		date.getFullYear() + " " +
		date.getHours() + ":" +
		date.getMinutes() + ":" +
		date.getSeconds();
	return date_str;

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

/*Load list of products
use 'all' for no filter
*/
function getLicenseStatus( xmldata )
{
	if (xmldata == undefined )
	{
		ERROR( "XMLDoc is null" );
		return;
	}
		
	
	var vendorlicenses = xmldata.getElementsByTagName( "vendorlicense" );
	
	//create list of products
	var list=[];
	
	for ( i=0; i < vendorlicenses.length; ++i )
	{
	
		var featureslist = [];
		var features = vendorlicenses[i].getElementsByTagName( "feature" );
		
		//get list of features under this product
		for ( counter = 0; counter < features.length; ++counter)
		{
			var expires = features[counter].getAttribute("expires") ;
			expires = epochToDate ( expires );
			var used = features[counter].getAttribute("used");
			var licenses = features[counter].getAttribute("licenses");
			var percentage = parseInt( (used/licenses) * 100 );
			var visible = "hidden";
			if ( percentage != 0 )
				visible = "visible";
			

			var online = features[counter].getElementsByTagName("online");
			var entries = online[0].getElementsByTagName("entry");
			
			//get all users
			var userslist = [];
			for ( entry_id = 0; entry_id != entries.length; ++entry_id )
			{
				
				userslist.push( { user: entries[entry_id].getElementsByTagName("user")[0].innerHTML,
							display: entries[entry_id].getElementsByTagName("display")[0].innerHTML,
							host: entries[entry_id].getElementsByTagName("host")[0].innerHTML,
							count: entries[entry_id].getElementsByTagName("count")[0].innerHTML });
			}

			featureslist.push({ id	: i,
					name 			: features[counter].getAttribute("name") ,
					productname		: vendorlicenses[i].getAttribute("name")  ,
					version			: features[counter].getAttribute("version") ,
					expires			: expires,
					licenses		: features[counter].getAttribute("licenses") ,
					used 			: used ,
					users 			: userslist, 		
					percentage		: percentage,
					bar_visibility  : visible });
		} 

		var totallicenses = 0;
		var inuse = 0;
		
		for ( counter = 0; counter < features.length; ++counter )
		{
			totallicenses += parseInt( features[counter].getAttribute("licenses") );
			inuse += parseInt( features[counter].getAttribute("used") );
		}
		
		var percentage = parseInt( (inuse/totallicenses) * 100 );
		
		var visible = "hidden";
		if ( percentage != 0 )
			visible = "visible";
		
		
			
		list.push({ id				: i,
					productname 	: vendorlicenses[i].getAttribute("name")  ,
					client			: vendorlicenses[i].getAttribute("client"),
					type			: vendorlicenses[i].getAttribute("type") ,
					features		: featureslist,
					totallicenses	: totallicenses ,
					inuse 			: inuse,
					unused 			: parseInt( totallicenses - inuse ),
					percentage		: percentage,
					bar_visibility  : visible });
	}
	License_status = list;
	return list;
}

function getFeatureList( xmldata , filter )
{
	if (xmldata == undefined )
	{
		VERBOSE( "load_data-loadFeatures: XMLDoc is null " );
		return;
	}
	
	
	
	var vendorlicenses = xmldata.getElementsByTagName( "vendorlicense" );
	
	// Filter product name
	if ( filter != 'all' )
	{
		for( i=0; i < vendorlicenses.length; ++i )
		{
			if (vendorlicenses[i].getAttribute("name") == filter[1] )
			{
				var temp = vendorlicenses[i];
				vendorlicenses = [];
				vendorlicenses.push(temp);
				break;
			}
		}
	}
	
	var list = [];
	for ( i=0; i < vendorlicenses.length; ++i )
	{
		var productname = vendorlicenses[i].getAttribute("name");
		var features = vendorlicenses[i].getElementsByTagName( "feature" );
		for ( counter=0; counter < features.length; ++counter )
		{
			var expires = features[counter].getAttribute("expires") ;
			expires = epochToDate ( expires );
			var used = features[counter].getAttribute("used");
			var licenses = features[counter].getAttribute("licenses");
			var percentage = parseInt( (used/licenses) * 100 );
			var visible = "hidden";
			if ( percentage != 0 )
				visible = "visible";
			
			
			list.push({ id				: i,
					name 			: features[counter].getAttribute("name") ,
					productname		: productname ,
					version			: features[counter].getAttribute("version") ,
					expires			: expires,
					licenses		: features[counter].getAttribute("licenses") ,
					used 			: used ,
					percentage		: percentage,
					bar_visibility  : visible });
			
	
			
		}
	}
	return list;
}

function getUsersOfFeature()
{

	if (XMLDoc == undefined )
	{
		VERBOSE( "XMLDoc is null " );
		return;
	}
	
	DEBUG("Got filter '" + CurrentFilters + "'" );
	
	var filter = CurrentFilters.split('|');
	
	var vendorlicenses = XMLDoc.getElementsByTagName( "vendorlicense" );
	var found = false;
	// Filter product name
	if ( filter[1] != 'all' )
	{
		for( i=0; i < vendorlicenses.length; ++i )
		{
			if (vendorlicenses[i].getAttribute("name") == filter[1] )
			{
				var temp = vendorlicenses[i];
				vendorlicenses = [];
				vendorlicenses.push(temp);
				VERBOSE( "Found productname match for'" + filter[1]  + "'" );
				break;
			}
		}
	}
	
	//find feature
	var features = vendorlicenses[0].getElementsByTagName("feature");
	
	for ( i=0; i < features.length; ++i )
	{
		// Filter Features name
		if ( filter[2] != 'all' )
		{
			
			var name = features[i].getAttribute("name");
			if ( name == filter[2] )
			{
				var temp = features[i];
				features = [];
				features.push(temp);
				VERBOSE( "Found feature name match for'" + filter[2]  + "'" );
				break;
			}
		
		}			
	}
	
	var online = features[0].getElementsByTagName("online");
	var online_entries = online[0].getElementsByTagName("entry");
	
	var queued = features[0].getElementsByTagName("queued");
	var queued_entries = queued[0].getElementsByTagName("entry");
	
	
	//get online entries
	var online_list =[];
	for( i=0; i < online_entries.length; ++i )
	{
		/*var user = online_entries[i].childNodes[1].innerHTML;
		var display = online_entries[i].childNodes[3].innerHTML;
		var host = online_entries[i].childNodes[5].innerHTML;
		var start = online_entries[i].childNodes[7].innerHTML;
		var count = online_entries[i]..childNodes[9].innerHTML;*/
		
		online_list.push({
			id : i,
			user : online_entries[i].childNodes[1].innerHTML,
			display : online_entries[i].childNodes[3].innerHTML,
			host : online_entries[i].childNodes[5].innerHTML,
			start : epochToDate( online_entries[i].childNodes[7].innerHTML ),
			count : online_entries[i].childNodes[9].innerHTML
			
		});
	}
	
	//TODO: listing of queued data
	
	var list = [];
	list.push({online : online_list } );
	return list;
}



