async function drawRoute() {

    if (!state.startMarker) {
        alert("출발지를 선택하세요.");
        return;
    }

    if (!state.selectedPlace) {
        alert("관광지를 선택하세요.");
        return;
    }

    clearRoute();

    const start = state.startMarker.getLatLng();

    const url =
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${state.selectedPlace.lng},${state.selectedPlace.lat}?overview=full&geometries=geojson`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error();
        }

        const data = await response.json();

        if (data.code !== "Ok") {
            throw new Error();
        }

        const route = data.routes[0];

        const path = route.geometry.coordinates.map(([lng, lat]) => [
            lat,
            lng
        ]);

        animateRoute(path);
        updateRouteInfo(route);

    }

    catch {

        alert("경로를 찾을 수 없습니다.");

    }

}



/* ---------- Animation ---------- */

function animateRoute(path) {

    let index = 1;

    state.routeLine = L.polyline(
        [path[0]],
        {
            color: "#2B7CFF",
            weight: 6,
            opacity: 0.9
        }
    ).addTo(map);

    const animation = setInterval(() => {

        if (index >= path.length) {

            clearInterval(animation);

            createArrow();

            map.fitBounds(
                state.routeLine.getBounds(),
                {
                    padding: [60, 60]
                }
            );

            return;

        }

        state.routeLine.addLatLng(path[index]);
        index++;

    }, 8);

}



/* ---------- Route Info ---------- */

function updateRouteInfo(route) {

    document.getElementById("distance").textContent =
        `${(route.distance / 1000).toFixed(1)} km`;

    document.getElementById("duration").textContent =
        `${Math.round(route.duration / 60)} 분`;

}
/* ---------- Arrow ---------- */

function createArrow() {

    if (!state.routeLine) {
        return;
    }

    state.routeDecorator = L.polylineDecorator(state.routeLine, {
        patterns: [
            {
                offset: 25,
                repeat: 60,
                symbol: L.Symbol.arrowHead({
                    pixelSize: 12,
                    polygon: true,
                    pathOptions: {
                        color: "#2B7CFF",
                        fillOpacity: 1,
                        weight: 2
                    }
                })
            }
        ]
    }).addTo(map);

}



/* ---------- Clear ---------- */

function clearRoute() {

    if (state.routeLine) {
        map.removeLayer(state.routeLine);
        state.routeLine = null;
    }

    if (state.routeDecorator) {
        map.removeLayer(state.routeDecorator);
        state.routeDecorator = null;
    }

}



/* ---------- Reset ---------- */

function resetRoute() {

    clearRoute();

    map.closePopup();

    if (state.startMarker) {
        map.removeLayer(state.startMarker);
        state.startMarker = null;
    }

    state.placeMarkers.forEach(marker => {
        marker.setIcon(state.icons.blue);
        marker.closePopup();
    });

    state.selectedMarker = null;
    state.selectedPlace = null;

    document.getElementById("distance").textContent = "-";
    document.getElementById("duration").textContent = "-";

}



/* ---------- Events ---------- */

document
    .getElementById("resetBtn")
    .addEventListener("click", resetRoute);