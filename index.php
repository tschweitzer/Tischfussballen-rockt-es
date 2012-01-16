<!DOCTYPE html>
<html>
  <head>
<?php
include("defaultHeadInclude.php");
?>
    <script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=true&libraries=places"></script>
    <script type="text/javascript" src="MapView.js"></script>
    <script type="text/javascript" src="jshash-2.2/sha256-min.js"></script>
        
    <link rel="stylesheet" href="infowindow.css" type="text/css" media="screen" />
    <style type="text/css">
		html, body, #content, #mapSearchControls, #map_canvas {
			margin: 0;
			padding: 0;
		}
    </style>

	<script type="text/javascript">
		$(document).ready(function() {
		    $('#loginDialogLoginButton').live('click',function() {
			    var username = $('#loginDialogUsernameInput').val();
			    var password = $('#loginDialogPasswordInput').val();
			    var passwordHashed = hex_sha256(password);
		    	$.getJSON('LoginHandler.php?action=performLogin&username='+username+'&password='+passwordHashed, function(data) {
					console.log('here comes login json');
					console.log(data);
	
					$.each(data, function(key, val) {
						if ( key == 'readableName' ) {
							var readableName = val;
							$('#mainViewLoginButton .ui-btn-text').html('Logout ('+readableName+')');
							$('#mainViewLoginButton').attr('href', '');
						}
					});
				});
		        //alert('LoginDialog: login button pressed. Username = ' + username + ' Password = ' + password );
		    });
		    
		    $('#loginDialogCancelButton').live('click',function() {
		        //alert('LoginDialog: cancel button pressed');
		    });

		    $('#mainViewLoginButton').live('click',function() {
			    if ( $("#mainViewLoginButton").attr("href" ) == '' ) {
			    	$.getJSON('LoginHandler.php?action=performLogout', function(data) {
			    		$('#mainViewLoginButton .ui-btn-text').html('Login');
				    	$('#mainViewLoginButton').attr('href', 'loginDialog.html');
					});
			    }
		    });
	  }); 
	</script>
</head>
  <body>
  	<div id="page" data-role="page">
		<div id="header" data-role="header">
			<a id="mainViewLoginButton" href="loginDialog.html" data-rel="dialog" data-icon="check">Login</a>
			<h1>Tischfussballen rockt es!</h1>
			<a id="mainViewMenuButton" href="menuPage.html" data-rel="dialog" data-icon="gear">Menu</a>		
		</div><!-- /header -->
	
		<div id="content" data-role="content">				
			<fieldset data-role="controlgroup" data-type="horizontal" id="mapSearchControls">
			    <table>
			        <tr>
			            <td width="99%">
			                <input type="search" id="mapSearch" placeholder="Location"/>
			            </td>
			            <td width="1%">
			                <input type="button" id="mapSearchButton" value="search" />
			            </td>
			        </tr>
			    </table>
			</fieldset>

		    <div id="map_canvas"></div>
		    <div id="logging"></div>	
		</div><!-- /content -->
	</div><!-- /page -->
  </body>
</html>
