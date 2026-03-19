var O_EM = new EventManager();

var O_TempDisplay = new TemperatureDisplay(O_EM);

function updateTemperature() {
  O_EM.updateState();
}

const intervalID = setInterval(updateTemperature, (25 * 8 + 60 / 3) * 5 - 100);
