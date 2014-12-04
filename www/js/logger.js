function warning( message ) {
	console.log( "Warning: " + message );
}
function VERBOSE( message ) {
	console.log( "Verbose: " + message );
}
function VERBOSE( message, obj ) {
	console.log( "Verbose: " + message, obj );
}
function DEBUG( message ) {
	console.log( "Debug: " + message );
}
function ERROR( message ) {
	console.log( "Error: " + message );
}
function showError( message )
{
	alert( "Error: " + message );
}