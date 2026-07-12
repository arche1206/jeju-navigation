const map = createMap();

const normalLayer = createNormalLayer();
const satelliteLayer = createSatelliteLayer();

satelliteLayer.addTo(map);

createZoomControl();

const startIcon = createStartIcon();
const blueIcon = createBlueIcon();
const greenIcon = createGreenIcon();

state.icons.start = startIcon;
state.icons.blue = blueIcon;
state.icons.green = greenIcon;

createMapControl();
initPlaceMarkers();

map.on("click", ({ latlng }) => {
    createStartMarker(latlng);
});
function createMap() {

    const bounds = L.latLngBounds(
        [33.05, 126.05],
        [33.65, 126.98]
    );

    return L.map("map", {
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false,
    minZoom: 10,
    maxZoom: 18
}).setView([33.3617, 126.5292], 10);

}

function createNormalLayer() {

    return L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }
    );

}

function createSatelliteLayer() {

    return L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "&copy; Esri"
        }
    );

}

function createZoomControl() {

    L.control.zoom({
        position: "topright"
    }).addTo(map);

}
function createStartIcon() {

    return L.divIcon({
        className: "start-marker",
        html: `
            <div class="start-pin">
                <div class="start-dot"></div>
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });

}

function createBlueIcon() {

    return new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

}

function createGreenIcon() {

    return new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

}
function createStartMarker(latlng) {

    if (state.startMarker) {
        map.removeLayer(state.startMarker);
    }

    state.startMarker = L.marker(latlng, {
    icon: state.icons.start
}).addTo(map);

    state.startMarker.bindTooltip("출발지", {
        permanent: true,
        direction: "top"
    });
}
function selectPlace(marker, place) {

    if (state.selectedMarker) {
        state.selectedMarker.setIcon(state.icons.blue);
    }

    state.selectedMarker = marker;
    state.selectedPlace = place;

    marker.setIcon(state.icons.green);

}
function createPlacePopup(place) {

    return `
        <div class="popupTitle">${place.name}</div>

        <div class="popupRow">
            📍 ${place.address}
        </div>

        <div class="popupRow">
            🕒 ${place.time}
        </div>

        <div class="popupRow">
            💰 ${place.price}
        </div>

        <div class="popupRow">
            📝 ${place.description}
        </div>

        <button
            class="popupButton"
            onclick="drawRoute()">

            길찾기

        </button>
    `;

}
function initPlaceMarkers() {

    places.forEach(createPlaceMarker);

}

function createPlaceMarker(place) {

    const marker = L.marker(
        [place.lat, place.lng],
        {
            icon: state.icons.blue
        }
    ).addTo(map);

    marker.bindTooltip(place.name, {
        permanent: true,
        direction: "top",
        offset: [0, -10]
    });

    marker.bindPopup(createPlacePopup(place));

    marker.on("click", () => {

        selectPlace(marker, place);
        marker.openPopup();

    });

    state.placeMarkers.push(marker);

}
function createMapControl() {

    const control = L.control({
        position: "topright"
    });

    control.onAdd = () => {

        const div = L.DomUtil.create("div", "leaflet-bar");

        div.innerHTML = `
            <button id="normalMapBtn">🗺</button>
            <button id="satelliteMapBtn">🛰</button>
        `;

        return div;

    };

    control.addTo(map);

    map.whenReady(bindMapControlEvents);

}

function bindMapControlEvents() {

    document
        .getElementById("normalMapBtn")
        .addEventListener("click", showNormalMap);

    document
        .getElementById("satelliteMapBtn")
        .addEventListener("click", showSatelliteMap);

}

function showNormalMap() {

    if (map.hasLayer(satelliteLayer)) {
        map.removeLayer(satelliteLayer);
    }

    if (!map.hasLayer(normalLayer)) {
        normalLayer.addTo(map);
    }

}

function showSatelliteMap() {

    if (map.hasLayer(normalLayer)) {
        map.removeLayer(normalLayer);
    }

    if (!map.hasLayer(satelliteLayer)) {
        satelliteLayer.addTo(map);
    }

}
window.map = map;