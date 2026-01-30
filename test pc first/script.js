//suggestion
const departEst = document.getElementById("depart");
const suggestionsDepartEst = document.querySelector(".suggestion-depart");

let timeoutDepartEst = null;

departEst.addEventListener("input", function () {
  const query = this.value;
  clearTimeout(timeoutDepartEst);

  if (query.length < 3) {
    suggestionsDepartEst.innerHTML = "";
    return;
  }

  timeoutDepartEst = setTimeout(() => {
    fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        query,
      )}&limit=5`,
    )
      .then((response) => response.json())
      .then((data) => {
        suggestionsDepartEst.innerHTML = "";
        data.features.forEach((feature) => {
          const suggestionEst = document.createElement("p");
          suggestionEst.textContent = feature.properties.label;
          suggestionEst.addEventListener("click", () => {
            departEst.value = feature.properties.label;
            suggestionsDepartEst.innerHTML = "";
          });
          suggestionsDepartEst.appendChild(suggestionEst);
        });
      });
  }, 300); // petit délai pour éviter les appels trop rapides
});

const arriveEst = document.getElementById("arrivee");
const suggestionsArriveEst = document.querySelector(".suggestion-arrivee");

let timeoutArriveEst = null;

arriveEst.addEventListener("input", function () {
  const query = this.value;
  clearTimeout(timeoutArriveEst);

  if (query.length < 3) {
    suggestionsArriveEst.innerHTML = "";
    return;
  }

  timeoutArriveEst = setTimeout(() => {
    fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
        query,
      )}&limit=5`,
    )
      .then((response) => response.json())
      .then((data) => {
        suggestionsArriveEst.innerHTML = "";
        data.features.forEach((feature) => {
          const suggestionEst = document.createElement("div");
          suggestionEst.textContent = feature.properties.label;
          suggestionEst.addEventListener("click", () => {
            arriveEst.value = feature.properties.label;
            suggestionsArriveEst.innerHTML = "";
          });
          suggestionsArriveEst.appendChild(suggestionEst);
        });
      });
  }, 300); // petit délai pour éviter les appels trop rapides
});
//fin suggestion

//map openstreet
document.addEventListener("DOMContentLoaded", () => {
  // Supprimer la carte précédente uniquement si elle existe

  // Initialisation de la carte
  const map = L.map("map").setView([48.866667, 2.333333], 11);
  window.map = map;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  let markers = [];
  let routeLine = null;

  // Géocodage : adresse → coordonnées
  async function geocode(adresse) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      adresse,
    )}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.length === 0) throw new Error("Adresse introuvable : " + adresse);

    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  }

  // Distance réelle via OSRM
  async function getDistanceOSRM(lat1, lon1, lat2, lon2) {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "Ok") {
      const route = data.routes[0];

      if (routeLine) map.removeLayer(routeLine);
      routeLine = L.geoJSON(route.geometry, {
        color: "rgb(34, 195, 93)",
        weight: 6,
      }).addTo(map);

      return route.distance / 1000; // km
    } else {
      throw new Error("Erreur OSRM : " + data.message);
    }
  }

  // Calcul principal
  async function calculer() {
    const depart = document.getElementById("depart").value.trim();
    const arrivee = document.getElementById("arrivee").value.trim();
    const resultEuro = document.querySelector(".result-euro");
    const resultdistance = document.querySelector(".result-distance");
    const result = document.getElementById("result");

    if (!depart || !arrivee) {
      alert("Veuillez entrer deux adresses valides !");
      return;
    }

    try {
      result.textContent = "⏳ Estimation en cours...";
      console.log("Départ:", depart);
      console.log("Arrivée:", arrivee);
      const coordDepart = await geocode(depart);
      const coordArrivee = await geocode(arrivee);

      markers.forEach((m) => map.removeLayer(m));
      markers = [
        L.marker([coordDepart.lat, coordDepart.lon])
          .addTo(map)
          .bindPopup("Départ")
          .openPopup(),
        L.marker([coordArrivee.lat, coordArrivee.lon])
          .addTo(map)
          .bindPopup("Arrivée"),
      ];

      map.fitBounds(L.latLngBounds(markers.map((m) => m.getLatLng())), {
        padding: [50, 50],
      });

      const distanceKm = await getDistanceOSRM(
        coordDepart.lat,
        coordDepart.lon,
        coordArrivee.lat,
        coordArrivee.lon,
      );
      const prix = 3 + 7 + distanceKm * 2;

      resultdistance.textContent = `${distanceKm.toFixed(2)} km`;
      resultEuro.textContent = `${prix.toFixed(2)} €`;
    } catch (err) {
      console.error(err);
      alert("Erreur : " + err.message);
      result.textContent = "";
    }
  }

  // Réinitialiser la carte
  function resetCarte() {
    document.getElementById("depart").value = "";
    document.getElementById("arrivee").value = "";
    document.getElementById("result").textContent = "";
    document.querySelector(".result-euro").textContent = "";
    document.querySelector(".result-distance").textContent = "";

    markers.forEach((m) => map.removeLayer(m));
    markers = [];

    if (routeLine) {
      map.removeLayer(routeLine);
      routeLine = null;
    }

    map.setView([46.5, 2.5], 6);
  }

  // Boutons
  document.querySelector(".btn-estimation").addEventListener("click", calculer);
  document
    .querySelector(".btn-reinitialiser")
    .addEventListener("click", resetCarte);
});
//fin map openstreet
