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