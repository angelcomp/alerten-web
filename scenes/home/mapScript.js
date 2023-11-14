
var allMarkers = {}

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
        document.getElementById("map-content-form").style.display = "grid";
        arrowButton.style.transform = "rotate(180deg)"
        isMapContentClosed = false
    } else {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "1fr";
        document.getElementById("map-content-form").style.display = "none";
        arrowButton.style.transform = "rotate(0deg)"
        isMapContentClosed = true
    }
}

var isAddMarkerActive = false
map.on('click', this.addMarker.bind(this));

function activeMap() {

    if(isAddMarkerActive) {
        document.getElementById("info-add-marker").style.display = "none";
        map.setLayoutProperty('escola', 'visibility', 'visible');
        document.getElementById("add-on-map").style.transform = "rotate(0deg)"
        isAddMarkerActive = false
    } else {
        document.getElementById("info-add-marker").style.display = "block";
        map.setLayoutProperty('escola', 'visibility', 'none');
        document.getElementById("add-on-map").style.transform = "rotate(45deg)"
        isAddMarkerActive = true
    }
}

function addMarker(event) {
    if(isAddMarkerActive) {
        var coordinates = event.lngLat;
        
        const markerPopup = new maplibregl.Popup({
            closeOnClick: true,
            className: "marker"
        }).setHTML("<b> A popup that is shown when you click on a marker</b>");
        
        var marker = new maplibregl.Marker().setLngLat(coordinates).setPopup(markerPopup).addTo(map);
        
        allMarkers[Date.now()] = marker
        
        activeMap()
        openMapcontent()
        setLngLatDataOnForm(coordinates)
    }
}

function setLngLatDataOnForm(coordinates) {
    document.getElementById("lng").value = coordinates.lng
    document.getElementById("lat").value = coordinates.lat

    document.getElementById("map-content-form-date").value = getDateNow()
}

function saveDataFromForm() {
    var latValue = document.getElementById("lat").value
    var lngValue = document.getElementById("lng").value
    var nameValue = document.getElementById("map-content-form-name").value
    var emailValue = document.getElementById("map-content-form-email").value
    var phoneValue = document.getElementById("map-content-form-phone").value
    var descriptionValue = document.getElementById("map-content-form-description").value

    var occurrence = {
        creationDate: getDateNow(),
        personalInfo: {
            name: nameValue,
            email: emailValue,
            phone: phoneValue
        },
        occurrenceInfo: {
            longitude: lngValue,
            latitude: latValue,
            description: descriptionValue
        }
    }

    console.log(occurrence)
    clearForm()
}

function clearForm() {
    document.getElementById("lat").value = ""
    document.getElementById("lng").value = ""
    document.getElementById("map-content-form-name").value = ""
    document.getElementById("map-content-form-email").value = ""
    document.getElementById("map-content-form-phone").value = ""
    document.getElementById("map-content-form-date").value = ""
    document.getElementById("map-content-form-description").value = ""

    openMapcontent() // in this case it will close this content
}

function removeMarkerById(id) {
    console.log(id)
    var marker = allMarkers[id];
    marker.remove()
    delete allMarkers[id]
}

function getDateNow() {
    var date = new Date()
    var day = date.getDay()
    var month = date.getMonth()
    var year = date.getFullYear()

    return `${day}/${month}/${year}`
}