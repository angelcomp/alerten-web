var schoolList = []

fetch('../../geodata/escolas-pocos.geojson')
.then((response) => response.json())
.then((json) =>  {
    json.features.map( (escola) => {
        schoolList.push(escola)
    })

    showSchoolList()
});

var isSchoolListOpen = false

function openMarkerList() {

    document.getElementById("add-on-map").style.display = "none"
    document.getElementById("see-marker-list").style.display = "none"

    if (isAsideContentClosed && !isSchoolListOpen) {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "2fr 3fr";
        document.getElementById("map-aside-content").style.display = "grid";
        document.getElementById("marker-form-data").style.display = "none";
        document.getElementById("school-list-content").style.display = "block";
        isAsideContentClosed = false
    } else {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "1fr";
        document.getElementById("map-aside-content").style.display = "none";
        document.getElementById("add-on-map").style.display = "block"
        document.getElementById("school-list-content").style.display = "none";
        isAsideContentClosed = true
    }
}

function showSchoolList() {
    
    schoolList.map( (item) => {
        
        var div = document.createElement("div");
        div.id = "marker-item"

        var divInfo = document.createElement("div");
        divInfo.id = "marker-item-info"
        div.appendChild(divInfo)
        
        var h3 = document.createElement("h3")
        h3.innerText = item.properties.name
        divInfo.appendChild(h3)

        var p = document.createElement("p")
        p.innerText = item.properties.address
        divInfo.appendChild(p)

        var span = document.createElement("span")
        span.innerText = item.geometry.coordinates
        divInfo.appendChild(span)

        var divButtons = document.createElement("div");
        divButtons.id = "marker-item-buttons"
        div.appendChild(divButtons)

        var zoomButton = document.createElement("button")
        zoomButton.id = "zoom-marker"
        zoomButton.innerText = "Ver no mapa";
        zoomButton.onclick = () => {
            seeMarkerOnMap(item)
        }
        divButtons.appendChild(zoomButton)

        var parentDiv = document.getElementById("school-list-content")
        parentDiv.appendChild(div)
    })
}

function seeMarkerOnMap(item) {
    map.easeTo({
        center: item.geometry.coordinates,
        zoom: 18
    });
}

function closeList() {
    document.getElementById("map-aside-content").style.display = "none";
    document.getElementById("map-dashboard").style.gridTemplateColumns = "1fr";
    document.getElementById("add-on-map").style.display = "block"
    document.getElementById("see-marker-list").style.display = "block"
    isAsideContentClosed = true
}

map.on("load", () => {
    // Add the escola cluster image
    map.loadImage(
        "../../assets/school-marker-cluster.png",
        (error, image) => {
            if (error) throw error;
            map.addImage("escola-cluster", image);
        },
    );
    // Add the simple escola image
    map.loadImage("../../assets/school-marker.png", (error, image) => {
        if (error) throw error;
        map.addImage("escola", image);
    });

    // Add a new source from our GeoJSON data and set the "cluster" option to true.
    // MapLibre will add the "point_count" property to your source data
    map.addSource("escolas", {
        type: "geojson",
        data: "../../geodata/escolas-pocos.geojson",
        cluster: true,
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    });

    // Display the escola type as a separate symbol layer.
    // This layer is optional, to disable you can remove it completely
    map.addLayer({
        id: "escola-label",
        type: "symbol",
        source: "escolas",
        filter: ["!", ["has", "point_count"]],
        layout: {
            "text-field": ["get", "libellefrancais"],
            "text-padding": 0,
            "text-allow-overlap": false,
            "text-size": 11,
            "text-font": ["Roboto Regular", "Noto Regular"],
            "text-offset": [0, 1.75],
            "text-anchor": "top",
        },
        paint: {
            "text-color": "#5C5C5C",
            "text-halo-color": "#FFFFFF",
            "text-halo-width": 1,
        },
    });

    // Add a escola symbol as a symbol layer with icon.
    map.addLayer({
        id: "escola",
        type: "symbol",
        source: "escolas",
        layout: {
            // If the feature has the property "point_count" it means it's a cluster then we use the image "escola-cluster"
            // Otherwise we use the simple "escola" image.
            "icon-image": ["case", ["has", "point_count"], "escola-cluster", "escola"],
            // Display the cluster point count if >= 2
            "text-field": [
                "step",
                ["get", "point_count"],
                "",
                // If the point_count is < 99 then display as "99+"
                2,
                ["step", ["get", "point_count"], ["get", "point_count"], 20, "20+"],
            ],
            "icon-padding": 0,
            "text-padding": 0,
            "text-overlap": "always",
            "icon-overlap": "always",
            "text-size": 12,
            "text-font": ["Roboto Bold", "Noto Bold"],
            "text-anchor": "center",
        },
        paint: {
            "text-color": "#5C5C5C",
            // Translate the text to fit in the center of the top right area
            // Depending on your image, you might tune this value
            "text-translate": [13, -14],
            "text-translate-anchor": "viewport",
        },
    });
    
    // On click on a cluster, zoom to the expansion zoom level
    map.on("click", "escola", (e) => {
        const feature = e.features[0];
        var clusterId = feature.properties.cluster_id;
        if (!clusterId) {
            console.log(e)
            new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML('<h3>' + "Nome da Instituição Educacional:" + '</h3><p>' + e.features[0].properties.name+ '</p>' +
                    '<h3>' + "Endereço:" + '</h3><p>' + e.features[0].properties.address + '</p>')
            .addTo(map);
        } else {
            map.getSource("escolas").getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                map.easeTo({
                    center: feature.geometry.coordinates,
                    zoom: zoom + 0.5,
                });
            });
        }
    });

    map.on("mouseenter", "escola", () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "escola", () => {
        map.getCanvas().style.cursor = "";
    });
});