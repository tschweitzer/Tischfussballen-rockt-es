/**
 * 
 */
var map;
var geocoder;
var infowindow;
var placesService;
var markersArray = [];

var tableSoccerLocations = new Object();

function createFooseramaLink(title, street, plz, city, phone) {
	var link = "http://www.fooserama.de/index.php?option=com_staticxt&hinzufuegen_form&Itemid=17";
	link += "%22%3E%3Cscript%20src=%22http://ajax.microsoft.com/ajax/jquery/jquery-1.4.2.min.js%22%20type=%22text/javascript%22%3E%3C/script%3E%3Cscript%20type=%22text/javascript%22%3E$(document).ready(function()%20{$('form[name=%22hinzufuegen%22]')[0].action='/index.php%3Foption=com_staticxt%26Itemid=17%26';$('form[name=%22hinzufuegen%22]')[0].method='post';";
	link += "$('input[name=%22name%22]')[0].value='"+title+"';";
	link += "$('input[name=%22strasse%22]')[0].value='"+street+"';";
	link += "$('input[name=%22plz%22]')[0].value='"+plz+"';";
	link += "$('input[name=%22stadt%22]')[0].value='"+city+"';";
	link += "$('input[name=%22telefon%22]')[0].value='"+phone+"';";
	link += "});%3C/script%3E%3Cspan%20id=%22y";
	
	return link;
}

function encodeForURL(text) {
	var result = text;
	// http://www.dorf-rauxel.de/picard/tools/urlcode.php
	// ä      ö      ü      Ä      Ö      Ü      ß
	// %C3%A4 %C3%B6 %C3%BC %C3%84 %C3%96 %C3%9C %C3%9F
	//    %E4    %F6    %FC    %C4    %D6    %DC    %DF
	result = result.replace(/ä/g, "%E4");
	result = result.replace(/ö/g, "%F6");
	result = result.replace(/ü/g, "%FC");
	result = result.replace(/Ä/g, "%C4");
	result = result.replace(/Ö/g, "%D6");
	result = result.replace(/Ü/g, "%DC");
	result = result.replace(/ß/g, "%DF");
	result = result.replace(/ /g, "%20");
/*		result = result.replace(/%C3%9F/g, "%DF");
	result = result.replace(/%C3%A4/g, "%E4");
	result = result.replace(/%C3%A4/g, "%E4");
	result = result.replace(/%C3%B6/g, "%F6");
	result = result.replace(/%C3%BC/g, "%FC");
	result = result.replace(/%C3%84/g, "%C4");
	result = result.replace(/%C3%96/g, "%D6");
	result = result.replace(/%C3%9C/g, "%DC");
	result = result.replace(/%C3%9F/g, "%DF"); */
	//return URL.encode( result );
	return result;
}

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


function convertSearchResultToLocation(result) {
	var name = '';
	var position = result.geometry.location;
	var route = '';
	var street_number = '';
	var city = '';
	var postal_code = '';
	var phone = '';
	var website = '';
	
	if ( result.name != null )
		name = result.name;
	if ( result.formatted_phone_number != null )
		phone = result.formatted_phone_number;
	if ( result.website != null )
		website = result.website;
	
	var address_components = result.address_components;
	for (var i = 0; i < address_components.length; i++) {
		if ( address_components[i].types[0] == 'street_number' )
			street_number = address_components[i].long_name;
		else if ( address_components[i].types[0] == 'route' )
			route = address_components[i].long_name;
		else if ( address_components[i].types[0] == 'administrative_area_level_3' )
			city = address_components[i].long_name;
		else if ( address_components[i].types[0] == 'locality' )
			city = address_components[i].long_name;
		else if ( address_components[i].types[0] == 'postal_code' )
			postal_code = address_components[i].long_name;
		else if ( address_components[i].types[0] == 'phone' )
			phone = address_components[i].long_name;
	}
	
	return {
		'name': name,
		'position': position,
		'address': route + ' ' + street_number,
		'city': city,
		'postal_code': postal_code,
		'phone': phone,
		'website': website
	};
}

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
			placesService.getDetails(place, createMarkerFromSearchResult);
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
		geocoder.geocode( {'address': address}, createMarkersFromSearchResults);
	}
}

function createMarkerFromSearchResult(result, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		var location = convertSearchResultToLocation(result);
		createMarker(location, false);
	}
}

function createMarkerFromMapClick(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		removeAllMarkers();
		var place = results[0];
		var location = convertSearchResultToLocation(place);
		createMarker(location, true);
	}
}


function createMarker(location, openInfoWindowDirectly) {
	openInfoWindowDirectly = typeof(openInfoWindowDirectly) != 'undefined' ? openInfoWindowDirectly : false;
	var marker = new google.maps.Marker({
		map: map,
		position: location.position
	});
	markersArray.push(marker);
	
	var infoWindowContent = '<div class="iw">';
	if ( location.name != '' )
		infoWindowContent += '<span class="title">'+location.name+'</span>';
	infoWindowContent += '<div class="basicinfo">';
	if ( location.website != '' )
		infoWindowContent += '</br><a href="' + location.website + '">' + location.website + '</a>';
	if ( location.phone != '' )
		infoWindowContent += '</br>' + location.phone;
	if ( location.address != '' )
		infoWindowContent += '</br>' + location.address;
	if ( location.postal_code != '' && location.city != '' )
		infoWindowContent += '</br>' + location.postal_code + ', ' + location.city;
	var fooseramaLink = createFooseramaLink(encodeForURL(location.name), encodeForURL(location.city), '', encodeForURL(''), encodeForURL(''));
	infoWindowContent += '<br/><a href="' + fooseramaLink + '">Zu Fooserama hinzufügen</a></div></div>';
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(infoWindowContent);
		infowindow.open(map, this);
	});
	
	if ( openInfoWindowDirectly ) {
		infowindow.setContent(infoWindowContent);
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
