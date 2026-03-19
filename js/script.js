/* global EventManager, TemperatureDisplay */
/* eslint-disable no-unused-vars */

const O_EM = new EventManager();

const O_TempDisplay = new TemperatureDisplay(O_EM);

const F_updateTemperature = function() {
  O_EM.updateState();
};

const I_intervalID = setInterval(F_updateTemperature, (25 * 8 + 60 / 3) * 5 - 100);