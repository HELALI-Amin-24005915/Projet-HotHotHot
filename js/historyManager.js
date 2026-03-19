/* eslint-disable no-unused-vars */

class HistoryManager {
  constructor(O_eventManager) {
    this.O_eventManager = O_eventManager;
    this.O_tableBody = document.getElementById("historyList");

    if (!this.O_tableBody) {
      console.error(
        "L'élément 'historyList' (tbody) n'a pas été trouvé dans le DOM",
      );
      return;
    }

    this.O_eventManager.subscribe(this.update.bind(this));
  }

  addRowToTable(I_temperature) {
    const O_row = document.createElement("tr");

    const O_cellTemperature = document.createElement("td");
    O_cellTemperature.textContent = `${I_temperature} °C`;

    const O_cellTime = document.createElement("td");
    const O_date = new Date();
    O_cellTime.textContent = O_date.toLocaleTimeString("fr-FR");

    O_row.appendChild(O_cellTemperature);
    O_row.appendChild(O_cellTime);

    this.O_tableBody.appendChild(O_row);
  }

  update(O_data) {
    const I_temperature = O_data.temperature;
    this.addRowToTable(I_temperature);
  }
}