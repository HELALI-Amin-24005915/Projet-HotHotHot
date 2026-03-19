/* eslint-disable no-unused-vars */

class TemperatureDisplay {
  constructor(O_eventManager) {
    this.eventManager = O_eventManager;
    this.O_AfficheTemp = document.getElementById("tempList");
    this.O_HistoryTableBody = document.getElementById("historyList");
    this.O_AfficheMesage = document.getElementById("message");

    this.eventManager.subscribe(this.update.bind(this));
  }

  update(O_state) {
    this.displayCurrentTemperature(O_state);
    this.updateHistoryTable();
  }

  displayCurrentTemperature(O_state) {
    this.O_AfficheTemp.textContent = O_state.currentTemperature + " °C";
    this.O_AfficheTemp.className = O_state.category;
    this.O_AfficheMesage.textContent = O_state.message;
  }

  updateHistoryTable() {
    const A_History = this.eventManager.getHistory();

    this.O_HistoryTableBody.innerHTML = "";

    A_History.forEach((O_entry) => {
      const O_row = this.O_HistoryTableBody.insertRow();
      const O_cellTime = O_row.insertCell(0);
      const O_cellTemp = O_row.insertCell(1);

      O_cellTime.textContent = O_entry.time;
      O_cellTemp.textContent = O_entry.temperature + " °C";

      if (O_entry.temperature < 0) {
        O_row.className = "bleue";
      } else if (O_entry.temperature >= 0 && O_entry.temperature <= 20) {
        O_row.className = "vert";
      } else if (O_entry.temperature > 20 && O_entry.temperature <= 30) {
        O_row.className = "orange";
      } else {
        O_row.className = "rouge";
      }
    });
  }
  
  unsubscribe() {
    this.eventManager.unsubscribe(this.update.bind(this));
  }
}