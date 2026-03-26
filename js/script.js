/* global EventManager, TemperatureDisplay, SensorManager */
/* eslint-disable no-unused-vars */

const O_EM = new EventManager();

const O_temperatureDisplay = new TemperatureDisplay(O_EM);

// Initialiser le gestionnaire de capteurs (WebSocket + AJAX fallback)
const O_sensorManager = new SensorManager(O_EM);

// Les données viendront uniquement du WebSocket/AJAX
// Plus de boucle d'intervalle avec données aléatoires

