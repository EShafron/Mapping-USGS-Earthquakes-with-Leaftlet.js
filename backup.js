// Function to lighten & darken colors
// Source: <https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors>
function LightenDarkenColor(col,amt) {
  col = parseInt(col,16);
  return (((col & 0x0000FF) + amt) | ((((col>> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16);
}

// Object for 5 possible colors based on magnitude
var colors ={
  'verylow':"#58E500",
  'low':"#AADB00",
  'medium':"#D2AF00",
  'high':"#C85900",
  'veryhigh':"#BF0A00"
}

// Array for colors
var colorarray = ["#58E500","#AADB00","#D2AF00","#C85900","#BF0A00"]

// Array for legend labels
var legendlabels = ['<1','1-2','2-3','3-4','5+']

// Initial Map Object
var myMap = L.map("map", {
  center: [40.52, -95.67],
  zoom: 5
});

// Adding a tile layer
var Pirates = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.pirates",
  accessToken: API_KEY
})
.addTo(myMap);

// Past 30 days - all earthquakes
var month_all_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'

// Past 7 days - all earthquakes
var week_all_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'


// Var to quickly check range of magnitudes
var mags=[]

d3.json(week_all_url, function(response){
  var quakes = response.features

  // console.log(quakes);

  // Lon 1st, lat 2nd
  // console.log(response.features[0].geometry.coordinates.slice(0,2));
  // console.log(quakes[0].geometry.coordinates);

  for(i=0;i<quakes.length;i++){
  // for(i=0;i<=10;i++){
    var lat=quakes[i].geometry.coordinates[1]
    var lon=quakes[i].geometry.coordinates[0]
    var mag=quakes[i].properties.mag
    var title=quakes[i].properties.title
    var time=quakes[i].properties.time

    var colortag;

    if(mag<1){colortag="verylow";}
    else if(mag<2){colortag="low";}
    else if(mag<3){colortag="medium";}
    else if(mag<4){colortag="high";}
    else{colortag="veryhigh";}

    color = colors[colortag];

    // var myColor = "3F6D2A";
    // myColor = LightenDarkenColor(myColor,mag*100);
    // var color = ("#" + myColor);

    // L.marker([lat,lon]).addTo(myMap);

    // Scale circle size through exponentiation (reflective of the power measured by the Ricther Scale)
    L.circle([lat, lon], {
      color: color,
      fillColor: color,
      // color: "gold",
      // fillColor: "gold",   
      fillOpacity: 0.75,
      radius: Math.pow(7.5,mag)
    })
    .bindPopup("<h3><strong>"+title+"<strong><h3><hr><h4>Magnitude: "+mag+"<h4><h4>Time: "+time+"<h4>")
    .addTo(myMap);

    mags.push(mag)
  }

  console.log(d3.min(mags));
  console.log(d3.max(mags));
  

})

// URL for plates points
plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// JSON promise/response
d3.json(plates_url,function(response){

  // Pull features for total response
  var plates = response.features;

  // Loop through each plate
  plates.forEach(function(plate){

    // Pull coordinates for each point of plate
    var lines=plate.geometry.coordinates;

    // Initalize empty array
    var path=[];

    // Quick map function to switch order of lat & lon
    lines.map(function(line){
      path.push([line[1],line[0]])
    })

    // Add line to map
    L.polyline(path,{
      color:"orange",
    }).addTo(myMap);

  })

// Coordinates for each point to be used in the polyline
// var line = [
//   [45.51, -122.68],
//   [45.50, -122.60],
//   [45.48, -122.70],
//   [45.54, -122.75]
// ];

// // Create a polyline using the line coordinates and pass in some initial options
// L.polyline(line, {
//   color: "red"
// }).addTo(myMap);

})

// var baseMaps = {
//   Street: streetLayer  
// }; 

// // Create an overlayMaps object to hold the bikeStations layer
// var overlayMaps = {
//   ComingSoom: layers.COMING_SOON,
//   Empty: layers.EMPTY,
//   OutOfOrder: layers.OUT_OF_ORDER,
//   Low: layers.LOW,
//   Normal: layers.NORMAL
// };


// // Create the map object with options
//   var map = L.map("map-id", {
//     center: newYorkCoords,
//     zoom: mapZoomLevel,
//     layers: [streetLayer
//       ,layers.COMING_SOON
//       ,layers.EMPTY
//       ,layers.OUT_OF_ORDER
//       ,layers.LOW
//       ,layers.NORMAL]
//   });

//   var layers = {
//     COMING_SOON : new L.LayerGroup(),
//     EMPTY : new L.LayerGroup(),
//     OUT_OF_ORDER : new L.LayerGroup(),
//     LOW : new L.LayerGroup(),
//     NORMAL : new L.LayerGroup()
//   };

//   var newMarker = L.marker([station.lat,station.lon]
//     ,{icon: icons[stationStatusCode]}
//   ).bindPopup("<h3>"+station.name+"<h3><h3>Capacity: "+station.capacity+"<h3><h3>Available: " 
//   + station.num_bikes_available + "<h3>");

//   // Add marker to appropriate layer
//   newMarker.addTo(layers[stationStatusCode]);

//    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
//   L.control.layers(baseMaps, overlayMaps).addTo(map);



// Create a legend to display information about our map
// var info = L.control({
//   position: "bottomright"
// });

// // When the layer control is added, insert a div with the class of "legend"
// info.onAdd = function() {
//   var div = L.DomUtil.create("div", "legend");
//   return div;
// };
// // Add the info legend to the map
// info.addTo(map);

// Legend
// Source <https://leafletjs.com/examples/choropleth/>

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 2, 3, 4, 5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            // '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            // grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            '<i style="background:' + colorarray[i] + '"></i> ' +
            legendlabels[i] + "<br>"

            ;
    }

    return div;
};

legend.addTo(myMap);