
var allMarkers = {}
var lastUncreatedMarkerId = -1

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

var isAsideContentClosed = true
function openForm() {
    if (isAsideContentClosed && !isAddMarkerActive) {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "2fr 3fr";
        document.getElementById("map-aside-content").style.display = "grid";
        document.getElementById("marker-form-data").style.display = "flex";
        document.getElementById("school-list-content").style.display = "none";
        isAsideContentClosed = false
    } else {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "1fr";
        document.getElementById("map-aside-content").style.display = "none";
        document.getElementById("add-on-map").style.display = "block"
        document.getElementById("see-marker-list").style.display = "block"
        isAsideContentClosed = true
    }
}

var isAddMarkerActive = false
map.on('click', this.addMarker.bind(this));

function activeMap() {

    document.getElementById("add-on-map").style.display = "none"
    document.getElementById("see-marker-list").style.display = "none"

    if(isAddMarkerActive) {
        document.getElementById("info-add-marker").style.display = "none";
        map.setLayoutProperty('escola', 'visibility', 'visible');
        isAddMarkerActive = false
    } else {
        document.getElementById("info-add-marker").style.display = "block";
        map.setLayoutProperty('escola', 'visibility', 'none');
        isAddMarkerActive = true
    }
}

function addMarker(event) {
    lastUncreatedMarkerId = Date.now()

    if(isAddMarkerActive) {
        var coordinates = event.lngLat;
        
        const markerPopup = new maplibregl.Popup({
            closeOnClick: true,
            className: "marker"
        }).setHTML("<b> A popup that is shown when you click on a marker</b>");
        
        var marker = new maplibregl.Marker().setLngLat(coordinates).setPopup(markerPopup).addTo(map);
        
        allMarkers[lastUncreatedMarkerId] = marker
        
        activeMap() // in this case it will disable add marker on the map
        openForm()
        setLngLatDataOnForm(coordinates)
    }
}

function setLngLatDataOnForm(coordinates) {
    document.getElementById("lng").value = coordinates.lng
    document.getElementById("lat").value = coordinates.lat

    document.getElementById("map-aside-content-date").value = getDateNow()
}

function saveDataFromForm() {
    var latValue = document.getElementById("lat").value.trim()
    var lngValue = document.getElementById("lng").value.trim()
    var nameValue = document.getElementById("map-aside-content-name").value.trim()
    var emailValue = document.getElementById("map-aside-content-email").value.trim()
    var phoneValue = document.getElementById("map-aside-content-phone").value.trim()
    var descriptionValue = document.getElementById("map-aside-content-description").value.trim()

    // var addressValue = document.getElementById("map-aside-content-address").value.trim()
    var addressValue = "Rua bla bla 12 - centro" // mocked since we dont have an API to search the address by lng/lat

    if (
        nameValue.length === 0 ||
        emailValue.length === 0 ||
        phoneValue.length  === 0 ||
        descriptionValue.length === 0
    ) {
        alert("Você precisa preencher todos os campos!")
    } else {
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
                description: descriptionValue,
                address: addressValue
            }
        }
        console.log(occurrence)

        lastUncreatedMarkerId = -1 // since the marker was created, setting id to -1 (default)
        clearForm()
    }
}

function clearForm() {
    document.getElementById("lat").value = ""
    document.getElementById("lng").value = ""
    document.getElementById("map-aside-content-name").value = ""
    document.getElementById("map-aside-content-email").value = ""
    document.getElementById("map-aside-content-phone").value = ""
    document.getElementById("map-aside-content-date").value = ""
    document.getElementById("map-aside-content-description").value = ""

    openForm() // in this case it will close this content
    
    if (lastUncreatedMarkerId !== -1) {
        removeMarkerById(lastUncreatedMarkerId)
    }
}

function removeMarkerById(id) {
    console.log(id)
    var marker = allMarkers[id];
    marker.remove()
    delete allMarkers[id]
    lastUncreatedMarkerId = -1
}

function getDateNow() {
    var dt = new Date();
    var day = dt.getUTCDate()
    var month = dt.getUTCMonth()+1
    var year = dt.getUTCFullYear()
    return (day + '/' + month) + '/' + year
}