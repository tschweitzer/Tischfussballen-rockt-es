<?php // -*-php-*- (sets emacs to use php mode)

function performLogin() {
	$username = $_GET["username"];
	$passwordHashed = $_GET["password"];
	$passwordHashedAndSalted = hash("sha256", $username + "ThisIsSomeTextAsASalt!::;@Secure" + $passwordHashed);
	
	$jsonOutArray = array("username" => "karlUserName", "readableName" => "Karl");
	
	header("Content-type: text/plain");
	echo json_encode($jsonOutArray);
}

function performLogout() {

}

function checkIfLoggedIn() {

}

if ( $_GET["action"] == "performLogin")
	performLogin();
else if ( $_GET["action"] == "performLogout")
	performLogout();
else if ( $_GET["action"] == "checkIfLoggedIn")
	checkIfLoggedIn();

/*
header("Content-type: text/plain");
$jsonFileContent = file_get_contents("test.json");
echo $jsonFileContent;
*/

?>