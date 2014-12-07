<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');  

echo file_get_contents( ( 'data.xml') );
?>