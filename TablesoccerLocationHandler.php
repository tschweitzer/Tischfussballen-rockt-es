<?php // -*-php-*- (sets emacs to use php mode)


//$_GET['action'] == 'getLocationWithinBounds'
$north = floatval($_GET['north']);
$south = floatval($_GET['south']);
$west = floatval($_GET['west']);
$east = floatval($_GET['east']);

/*
header("Content-type: text/plain");
$jsonFileContent = file_get_contents("test.json");
echo $jsonFileContent;
*/

$jsonOutArray = array();
$jsonFileContent = file_get_contents("resources/jsonDataSet.txt");
//$jsonFileContent = file_get_contents("test.json");
//$jsonOutArray[] = array("aaargha");

$jsonArray = json_decode($jsonFileContent, true);
if ( count($jsonArray) == 0 )
	$jsonOutArray[] = array("aaargha22", json_last_error(), JSON_ERROR_CTRL_CHAR);

foreach ($jsonArray as &$dataSet) {
    $latitude = floatval($dataSet["Latitude"]);
    $longitude = floatval($dataSet["Longtitude"]);
    //$jsonOutArray[] = array($latitude, $longitude, $north, $south, $west, $east);
    
    if ( $latitude <= $north && $latitude >= $south && $longitude <= $east && $longitude >= $west ) {
		$jsonOutArray[] = $dataSet;
	}
}


header("Content-type: text/plain");
echo json_encode($jsonOutArray);

?>