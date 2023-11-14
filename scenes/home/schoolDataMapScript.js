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