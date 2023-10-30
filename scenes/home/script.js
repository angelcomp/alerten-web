
// Don't forget to replace <YOUR_ACCESS_TOKEN> by your real access token!
const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=PRZRDk869lSZIQ2Szsuo`,
    zoom: 13,
    center: [-46.565015,  -21.7900],
    hash: true,
}).addControl(new maplibregl.NavigationControl(), "top-right");
// This plugin is used for right to left languages

let scale = new maplibregl.ScaleControl({
    maxWidth: 100,
    unit: 'imperial'
});
map.addControl(scale);

scale.setUnit('kilometers');

maplibregl.setRTLTextPlugin("https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js");


var isMapContentClosed = true
var arrowButton = document.getElementById("arrow-open-map")
function openMapcontent() {
    if (isMapContentClosed) {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "2fr 3fr";
        document.getElementById("map-content").style.display = "grid";
        arrowButton.style.transform = "rotate(180deg)"
        isMapContentClosed = false
    } else {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "1fr";
        document.getElementById("map-content").style.display = "none";
        arrowButton.style.transform = "none"
        isMapContentClosed = true
    }
}

function openForms() {
    document.getElementById("create-marker-forms").style.display = "block";
}

map.on('click', this.add_marker.bind(this));
map.on("click", "marker", (e) => {

    new maplibregl.Popup({
        closeOnClick: false,
    })
    .setLngLat([e.lngLat.lng, e.lngLat.lat])
    .setHTML("<b>Hello world!</b><br/> I am a popup.")
    .addTo(map);
})

function add_marker(event) {
    var coordinates = event.lngLat;

    const markerPopup = new maplibregl.Popup({
        closeOnClick: true,
        className: "marker"
    }).setHTML("<b> A popup that is shown when you click on a marker</b>");

    new maplibregl.Marker().setLngLat(coordinates).addTo(map);
    
    console.log('Lng:', coordinates.lng, 'Lat:', coordinates.lat);
}