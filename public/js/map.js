  mapboxgl.accessToken = mapToken;

  // Create map centered at listing coordinates
  const map = new mapboxgl.Map({
    container: 'map',          // ID of the map div
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,       // Use listing coordinates
    zoom: 9
  });
 
console.log(coordinates);
  // Add marker at listing location
  const marker = new mapboxgl.Marker({color: "red"})
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25}).setHTML("<h4>Your Destination!</h4>"))
    .addTo(map);