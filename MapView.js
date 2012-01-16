/**
 * 
 */
var map;
var geocoder;
var infowindow;
var placesService;
var markersArray = [];

var tableSoccerLocations = new Object();

function initializeMap() {

	// Initialize the global map specific objects.
	///////////////
	var luebeckLatLng = new google.maps.LatLng(53.868689, 10.683014);
	var myOptions = 
	{
			zoom : 14,
			center : luebeckLatLng,
			mapTypeId : google.maps.MapTypeId.ROADMAP 
	};
	map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
	geocoder = new google.maps.Geocoder();
	infowindow = new google.maps.InfoWindow();
	placesService = new google.maps.places.PlacesService(map);

	
	// Init some callback functions.
	////////////////
	$('input[id=mapSearch]').keypress(function (e) {
		if ( e.which == 13 ) {
			e.preventDefault();
			searchMap( $(this).val() );
			//alert( $(this).val() );
		}
	});

	$( "#mapSearchButton" ).bind( "click", function(event, ui) {
		searchMap( $('input[id=mapSearch]').val() );
	});

	google.maps.event.addListener(map, 'bounds_changed', function() {
		var north = map.getBounds().getNorthEast().lat();
		var east = map.getBounds().getNorthEast().lng();
		var south = map.getBounds().getSouthWest().lat();
		var west = map.getBounds().getSouthWest().lng();
		//$.getJSON('TablesoccerLocationHandler.php?north=52.50091&south=51.22821&west=12.77329&east=13.32118', function(data) {
		$.getJSON('TablesoccerLocationHandler.php?north='+north+'&south='+south+'&west='+west+'&east='+east, function(data) {
			console.log('here comes json');
			console.log(data);

			for (var i = 0; i < data.length; i++) {
				var id = 0;
				var tableSoccerLocation = new Object();

				$.each(data[i], function(key, val) {
					if ( key == 'Id' )
						id = val;
					else
						tableSoccerLocation[key] = val;
				});

				// Add new table soccer locations only.
				if ( ! tableSoccerLocations[id] ) {
					tableSoccerLocations[id] = tableSoccerLocation;
					createTableSoccerLocationMarker(tableSoccerLocation);
				}
			}
		});
	});
	
	google.maps.event.addListener(map, 'click', function(event) {
		geocoder.geocode( { 'location': event.latLng}, createMarkerFromMapClick);
	});

	
	// Adapt the map container size to the browser window size.
	adaptMainMapSize();
	//searchMap( $('input[name=mapSearch]').val() );
}

function searchMap(keyword) {
	removeAllMarkers();
	var request = {
			bounds: map.getBounds(),
			keyword: keyword
	};
	placesService.search(request, createMarkersFromSearchResults);
}

function removeAllMarkers() {
	if (markersArray) {
		for (i in markersArray) {
			markersArray[i].setMap(null);
		}
		markersArray.length = 0;
	}
}

function adaptMainMapSize() 
{
	var newMapHeight = $(window).height() - $('#map_canvas').offset().top - parseInt( $('#content').css('padding-bottom') );
	$('#map_canvas').height(newMapHeight);
}
$(window).resize(adaptMainMapSize);

function createMarkersFromSearchResults(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		var newMapBounds = null;
		for (var i = 0; i < results.length; i++) {
			var place = results[i];
			if ( newMapBounds == null ) {
				newMapBounds = new google.maps.LatLngBounds(place.geometry.location, place.geometry.location);
			}
			else {
				newMapBounds.extend(place.geometry.location);
			}

			createMarker(place.name, place.geometry.location, place.vicinity, false);
		}

		var zoomBeforeFit = map.getZoom();
		if ( results.length == 1 )
			map.panTo(results[0].geometry.location);
		else
			map.panToBounds(newMapBounds);

		map.fitToBounds(newMapBounds);

		if ( map.getZoom() > zoomBeforeFit )
			map.setZoom(zoomBeforeFit);
		else if ( map.getZoom() > 14 )
			map.setZoom(14);
	}
	// If the places search didn't find anything, try to use the geocoder for resolving a possible address.
	else {
		var address = $('input[id=mapSearch]').val();
		geocoder.geocode( { 'address': address}, createMarkersFromSearchResults);
	}
}

function createMarkerFromMapClick(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		removeAllMarkers();
		var place = results[0];
		createMarker('', place.geometry.location, place.formatted_address, true);
	}
}


function createMarker(name, position, vicinity, openInfoWindowDirectly) {
	openInfoWindowDirectly = typeof(openInfoWindowDirectly) != 'undefined' ? openInfoWindowDirectly : false;
	var marker = new google.maps.Marker({
		map: map,
		position: position,
	});
	markersArray.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent('<div class="iw"><span class="title">'+name+'</span><div class="basicinfo">'+vicinity+'</div></div>');
		infowindow.open(map, this);
	});
	
	if ( openInfoWindowDirectly ) {
		infowindow.setContent('<div class="iw"><span class="title">'+name+'</span><div class="basicinfo">'+vicinity+'</div></div>');
		infowindow.open(map, marker);
	}
}

function createTableSoccerLocationMarker(tableSoccerLocation) {
	var position = new google.maps.LatLng(tableSoccerLocation['Latitude'], tableSoccerLocation['Longtitude']);
	var markerImage = new google.maps.MarkerImage('resources/kickerSymbol_small.png', new google.maps.Size(40, 22), new google.maps.Point(0, 0), new google.maps.Point(19, 19));
	var shadowImage = new google.maps.MarkerImage('resources/kickerSymbol_shadow_small.png', new google.maps.Size(50, 14), new google.maps.Point(0, 0), new google.maps.Point(19, 19));
	var marker = new google.maps.Marker({
		map: map,
		position: position,
		icon: markerImage,
		shadow: shadowImage
	});

	var infoWindowContent;
	var name = tableSoccerLocation['Name'];

	infoWindowContent = '<html><div class="iw"><span class="title">'+name+'</span><div class="basicinfo">';

	if (tableSoccerLocation['Anschrift'] != undefined)
		infoWindowContent += '<div style="color:black; margin-top:-10px;"><b>Adresse:</b> ' + tableSoccerLocation['Anschrift'] + '</div>';

	if (tableSoccerLocation['Homepage'] != undefined)
		infoWindowContent += '<div><a href="' + tableSoccerLocation['Homepage'] + '">' + tableSoccerLocation['Homepage'] + '<a/></div>';


	if (tableSoccerLocation['Tisch'] != undefined) {
		infoWindowContent += '<br/>';
		infoWindowContent += '<div style="color:black; margin-bottom:5px;"><b>Tisch:</b> ' + tableSoccerLocation['Tisch'] + '</div>';
	}

	var infoWindowContentMaximized = infoWindowContent;
	if (tableSoccerLocation['Tischzustand'] != undefined)
		infoWindowContentMaximized += '<div style="color:black; margin-bottom:5px;"><b>Tischzustand:</b> ' + tableSoccerLocation['Tischzustand'] + '</div>';

	if (tableSoccerLocation['Spielniveau'] != undefined)
		infoWindowContentMaximized += '<div style="color:black; margin-bottom:5px;"><b>Spielniveau:</b> ' + tableSoccerLocation['Spielniveau'] + '</div>';

	if (tableSoccerLocation['Sonstiges'] != undefined)
		infoWindowContentMaximized += '<div style="color:black; margin-bottom:5px;"><b>Sonstiges:</b> ' + tableSoccerLocation['Sonstiges'] + '</div>';

	if (tableSoccerLocation['FooseramaLink'] != undefined)
		infoWindowContentMaximized += '<div style="color:black; margin-bottom:5px;"><a href="' + tableSoccerLocation['FooseramaLink'] + '">Info auf Fooserama</a></div>';

	infoWindowContent += '</div></div></html>';
	infoWindowContentMaximized += '</div></div>';
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(infoWindowContentMaximized);
		infowindow.open(map, this);
	});
}

google.maps.event.addDomListener(window, 'load', initializeMap);
