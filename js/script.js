/* global EventManager, TemperatureDisplay, SensorManager */
/* eslint-disable no-unused-vars */

const O_EM = new EventManager();

const O_temperatureDisplay = new TemperatureDisplay(O_EM);

const O_sensorManager = new SensorManager(O_EM);
O_sensorManager.F_startSimulation();

function F_registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function F_loadSW() {
      this.navigator.serviceWorker.register('/sw.js')
      .then(function F_onSuccess(O_registration) {
        console.log('Le ServiceWorker est enregistré: ', O_registration.scope);
      })
      .catch(function F_onError(O_error) {
        console.log('L\'enregistrement du ServiceWorker a échoué: ', O_error);
      });
    });
  }
}

F_registerServiceWorker();

