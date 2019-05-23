// Function to lighten & darken colors - ultimately not used
// Source: <https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors>
// function LightenDarkenColor(col,amt) {
//   col = parseInt(col,16);
//   return (((col & 0x0000FF) + amt) | ((((col>> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16);
// }

// Object for 5 possible colors based on magnitude
var colors ={
  'verylow':"#58E500",
  'low':"#AADB00",
  'medium':"#D2AF00",
  'high':"#C85900",
  'veryhigh':"#BF0A00"
}

// Layers for layer control
var layers = {
  'Earthquakes' : new L.LayerGroup(),
  'Plates' : new L.LayerGroup()
};

// Array for colors
var colorarray = ["#58E500","#AADB00","#D2AF00","#C85900","#BF0A00"]

// Array for legend labels
var legendlabels = ['<1','1-2','2-3','3-4','5+']

// Adding a tile layer
var pirates = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.pirates",
  accessToken: API_KEY
});
// .addTo(myMap);

// Adding another tile layer
var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});
// .addTo(myMap);

// Past 30 days - all earthquakes
var month_all_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'

// Past 7 days - all earthquakes
var week_all_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'


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
    var time=new Date(quakes[i].properties.time)

    var colortag;

    if(mag<1){colortag="verylow";}
    else if(mag<2){colortag="low";}
    else if(mag<3){colortag="medium";}
    else if(mag<4){colortag="high";}
    else{colortag="veryhigh";}

    color = colors[colortag];

    // Color scaling function - not used
    // var myColor = "3F6D2A";
    // myColor = LightenDarkenColor(myColor,mag*100);
    // var color = ("#" + myColor);


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
    .addTo(layers['Earthquakes']);
    // .addTo(myMap);


  }

  

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
    })
    .addTo(layers['Plates'])
    // .addTo(myMap);

  })


})

var baseMaps = {
  Pirate: pirates ,
  Light: light
}; 

// Create an overlayMaps object to hold the bikeStations layer
var overlayMaps = {
  Earthquakes: layers.Earthquakes,
  Plates: layers.Plates
};

// Initial Map Object
var myMap = L.map("map", {
  center: [40.52, -95.67],
  zoom: 5,
  layers: [pirates,
  light,
  layers.Earthquakes,
  layers.Plates]
});



// Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(myMap);



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