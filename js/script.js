/* global EventManager, TemperatureDisplay */
/* eslint-disable no-unused-vars */

const O_EM = new EventManager();

const O_temperatureDisplay = new TemperatureDisplay(O_EM);

/**
 * Met à jour l'état de température courant en déléguant à l'EventManager.
 * @param {void} V_noParam - Aucun paramètre attendu pour F_updateTemperature.
 * @return {void} Ne retourne aucune valeur.
 */
const F_updateTemperature = function() {
  O_EM.F_updateState();
};

const I_intervalID = setInterval(F_updateTemperature, (25 * 8 + 60 / 3) * 5 - 100);

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