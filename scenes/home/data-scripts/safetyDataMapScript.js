var safetyList = []

fetch('../../../geodata/seguranca-pocos.geojson')
.then((response) => response.json())
.then((json) =>  {
    json.features.map( (seguranca) => {
        safetyList.push(seguranca)
    })

    showSafetyList()
});

var isSafetyListOpen = false

function openMarkerList() {

    document.getElementById("add-on-map").style.display = "none"
    document.getElementById("see-marker-list").style.display = "none"

    if (isAsideContentClosed && !isSafetyListOpen) {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "2fr 3fr";
        document.getElementById("map-aside-content").style.display = "grid";
        document.getElementById("marker-form-data").style.display = "none";
        document.getElementById("list-content").style.display = "block";
        isAsideContentClosed = false
    } else {
        document.getElementById("map-dashboard").style.gridTemplateColumns = "1fr";
        document.getElementById("map-aside-content").style.display = "none";
        document.getElementById("add-on-map").style.display = "block"
        document.getElementById("list-content").style.display = "none";
        isAsideContentClosed = true
    }
}

function showSafetyList() {
    
    safetyList.map( (item) => {
        
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

        var parentDiv = document.getElementById("list-content")
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
    map.loadImage(
        "../../../assets/safety-marker-cluster.png",
        (error, image) => {
            if (error) throw error;
            map.addImage("seguranca-cluster", image);
        },
    );
    map.loadImage("../../../assets/safety-marker.png", (error, image) => {
        if (error) throw error;
        map.addImage("seguranca", image);
    });

    map.addSource("segurancas", {
        type: "geojson",
        data: "../../geodata/seguranca-pocos.geojson",
        cluster: true,
        clusterRadius: 50,
    });

    map.addLayer({
        id: "seguranca-label",
        type: "symbol",
        source: "segurancas",
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

    map.addLayer({
        id: "seguranca",
        type: "symbol",
        source: "segurancas",
        layout: {
            "icon-image": ["case", ["has", "point_count"], "seguranca-cluster", "seguranca"],
            "text-field": [
                "step",
                ["get", "point_count"],
                "",
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
            "text-translate": [13, -14],
            "text-translate-anchor": "viewport",
        },
    });
    
    map.on("click", "seguranca", (e) => {
        const feature = e.features[0];
        var clusterId = feature.properties.cluster_id;
        if (!clusterId) {
            console.log(e)
            new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML('<h3>' + e.features[0].properties.name+ '</h3>' +
                    '<p>' + e.features[0].properties.address + '</p>')
            .addTo(map);
        } else {
            map.getSource("segurancas").getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;
                map.easeTo({
                    center: feature.geometry.coordinates,
                    zoom: zoom + 0.5,
                });
            });
        }
    });

    map.on("mouseenter", "seguranca", () => {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "seguranca", () => {
        map.getCanvas().style.cursor = "";
    });
});