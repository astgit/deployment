/**
 * Load Google Maps API asynchronously
 */
define(['async!https://maps.googleapis.com/maps/api/js?client=gme-pancentricdigital&v=3.20!callback'], function () {
  return window.google.maps;
});