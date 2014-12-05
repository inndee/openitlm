var ServerUrl = "http://devcola.com/public_data/loadxml.php";
//var ServerUrl ="http://mnl242lin:8080/OpeniT/loadxml.php";
var License_status = [];

/*-------------------Getters----------------*/

function getServerUrl ()
{
	/*Prevent cache*/
	var randomNum = Math.round(Math.random() * 10000);
	return ServerUrl + "?rand=" + randomNum;
}


function getAllFeaturesData()
{
	var all_features = [];
	for (i =0; i !=License_status.length; i++)
    {
        License_status[i].features.forEach(function( entry ){
          all_features.push( entry );
        });  
    }
    return all_features;
}

/*-------------------Formatting----------------*/

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



function formatHtmlDetails( format_type, data )
{
	if ( format_type =='users' )
	{
		data.forEach( function (user) {
			user.usage.forEach( function (usage) {

			});
		});
	}
	
}


function removeDuplicatesInArray( array_data )
{
	var uniqueArray = array_data.filter(function(elem, pos) {
    	return array_data.indexOf(elem) == pos;
  	}); 
  	return uniqueArray;
}


/*Load list of products
use 'all' for no filter
*/
function parseLicenseStatus( xmldata )
{
	
	if (xmldata == undefined )
	{
		ERROR( "XMLDoc is null" );
		return;
	}
		
	VERBOSE("parsing License status data");
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
			var usage_meter = "";
			if ( percentage != 0 )
			{
				visible = "visible";
				usage_meter = "<hr align='left' width='" + percentage + "%' />"; 
			}
				
				
			var details = "<p>Product:  <b>" + vendorlicenses[i].getAttribute("name")  +"</b></p>" +
						  "<p>Licenses: <b>" + licenses + "</b></p>" +
						  "<p>In Use  : <b>" + used 	 + "</b></p><br/>" +
						  "<p>Expires : <b>" + expires  + "</b></p>";
			
			details += "<br/><br/><div class='meterbar'>" + 
						usage_meter +
					   "</div>";



			

			var online = features[counter].getElementsByTagName("online");
			var entries = online[0].getElementsByTagName("entry");
			
			//get all users
			var userslist = [];
			for ( entry_id = 0; entry_id != entries.length; ++entry_id )
			{
				
				userslist.push({ 
							item_name: entries[entry_id].getElementsByTagName("user")[0].innerHTML,
							display: entries[entry_id].getElementsByTagName("display")[0].innerHTML,
							host: entries[entry_id].getElementsByTagName("host")[0].innerHTML,
							count: entries[entry_id].getElementsByTagName("count")[0].innerHTML 
						});
			}

			featureslist.push({ id	: i,
					item_name 		: features[counter].getAttribute("name") ,
					productname		: vendorlicenses[i].getAttribute("name")  ,
					version			: features[counter].getAttribute("version") ,
					expires			: expires,
					licenses		: features[counter].getAttribute("licenses") ,
					used 			: used ,
					users 			: userslist, 		
					percentage		: percentage,
					bar_visibility  : visible,
					detailshtml 	: details  });
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
		var usage_meter = "";
		if ( percentage != 0 )
		{
			visible = "visible";
			usage_meter = "<hr align='left' width='" + percentage + "%' />"; 
		}
			
			
		var details = "<p>Total Licenses:<b> " + totallicenses + "</b></p>" +
					  "<p>In Use Licenses:<b> " + inuse + "</b></p>";
		
		details += "<br/><br/><div class='meterbar'>" + 
					usage_meter +
				   "</div>";
		
		var license = vendorlicenses[i].getElementsByTagName("licensefile")[0];

		if ( license != undefined )
			license = license.innerHTML;

		
		list.push({ id				: i,
					item_name 		: vendorlicenses[i].getAttribute("name")  ,
					client			: vendorlicenses[i].getAttribute("client"),
					type			: vendorlicenses[i].getAttribute("type") ,
					licensefile 	: license,
					features		: featureslist,
					totallicenses	: totallicenses ,
					inuse 			: inuse,
					unused 			: parseInt( totallicenses - inuse ),
					percentage		: percentage,
					bar_visibility  : visible ,
					detailshtml		: details
				});
	}
	DEBUG("Got '" + list.length + "' products");
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


function getAllUsersUsage()
{
	var usersdata = [];
        //TODO: get all users entry
        for (i =0; i !=License_status.length; i++)
        {
            License_status[i].features.forEach(function( entry ){
              if ( entry.users != 0 )
              {
                  entry.users.forEach(function( user ) {
                    user["productname"] = License_status[i].item_name;
                    user["featurename"] = entry.item_name;
                    usersdata.push( user );
                  });
              }       
            });  
        }

          var listofusers = [];

          //get list of users first
          usersdata.forEach( function ( entry ) {
           listofusers.push(entry.item_name); 
          }); 

          //merge duplicates
          var unique_users = removeDuplicatesInArray( listofusers );

          //organize data
          var users_usage_data = [];
          unique_users.forEach( function (user) {
            var userdata = [];
            var usage = [];
            userdata["item_name"] = user;
            usersdata.forEach( function (data) {
              if ( user == data.item_name )
                 usage.push( data );
            })
            userdata["usage"] = usage;
            users_usage_data.push(userdata);
          });

          return users_usage_data;

}


