<!doctype html>
<!-- paulirish.com/2008/conditional-stylesheets-vs-css-hacks-answer-neither/ -->
<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->
<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->
<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->
<!-- Consider adding a manifest.appcache: h5bp.com/d/Offline -->
<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->
<head>
  <meta charset="utf-8">

  <!-- Use the .htaccess and remove these lines to avoid edge case issues.
       More info: h5bp.com/b/378 -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

  <title>Tischfussballen rockt es!</title>
  <meta name="description" content="A map letting you discover table soccer locations.">
  <meta name="keywords" content="top table soccer, table soccer, tischfussball, kicker, kickern">

  <!-- Mobile viewport optimized: h5bp.com/viewport -->
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">

  <!-- Place favicon.ico and apple-touch-icon.png in the root directory: mathiasbynens.be/notes/touch-icons -->

  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/infowindow.css">
  <link rel="stylesheet" href="//code.jquery.com/mobile/1.0.1/jquery.mobile-1.0.1.min.css" />
<!--  <link rel="stylesheet" href="css/jquery.mobile-1.0.min.css"> -->
  <style type="text/css">
	html, body, #content, #mapSearchControls, #map_canvas {
		margin: 0;
		padding: 0;
	}
  </style>
  
  <!-- More ideas for your <head> here: h5bp.com/d/head-Tips -->

  <!-- All JavaScript at the bottom, except this Modernizr build.
       Modernizr enables HTML5 elements & feature detects for optimal performance.
       Create your own custom Modernizr build: www.modernizr.com/download/ -->
  <script src="js/libs/modernizr-2.0.6.min.js"></script>
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


  <!-- JavaScript at the bottom for fast page loading -->

  <!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if offline -->
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
  <script>window.jQuery || document.write('<script src="js/libs/jquery-1.7.1.min.js"><\/script>')</script>
  
  <script src="js/libs/jquery.mobile-1.0.min.js"></script>

  <script src="//maps.googleapis.com/maps/api/js?sensor=true&libraries=places"></script>

  <!-- scripts concatenated and minified via build script -->
  <script defer src="js/plugins.js"></script>
  <script defer src="js/script.js"></script>
  
  <script defer src="js/mylibs/MapView.js"></script>
  <!-- end scripts -->


  <!-- Asynchronous Google Analytics snippet. Change UA-XXXXX-X to be your site's ID.
       mathiasbynens.be/notes/async-analytics-snippet -->
  <script>
  /*
    var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];
    (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g,s)}(document,'script'));
    */
  </script>
  
  <script type="text/javascript">
		// From https://gist.github.com/716577
		function jqmSimpleMessage(message) {
		    $("<div class='ui-loader ui-overlay-shadow ui-body-b ui-corner-all'><h1>" + message + "</h1></div>")
		        .css({
		            display: "block",
		            opacity: 0.85,
		            top: window.pageYOffset+100
		        })
		        .appendTo("body").delay(3000)
		        .fadeOut(400, function(){
		            $(this).remove();
		        });
		}

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
		    
		    initializeMap();
		    
		    jqmSimpleMessage('This is just a test!');
	  }); 
	</script>

  <!-- Prompt IE 6 users to install Chrome Frame. Remove this if you want to support IE 6.
       chromium.org/developers/how-tos/chrome-frame-getting-started -->
  <!--[if lt IE 7 ]>
    <script src="//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js"></script>
    <script>window.attachEvent('onload',function(){CFInstall.check({mode:'overlay'})})</script>
  <![endif]-->

</body>
</html>
