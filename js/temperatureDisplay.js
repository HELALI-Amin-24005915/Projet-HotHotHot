/* eslint-disable no-unused-vars */

class TemperatureDisplay {
  /**
   * Initialise l'affichage des températures et l'abonnement aux mises à jour.
   * @param {Object} O_eventManager - Instance O_eventManager émettant les changements d'état.
   * @return {void} Ne retourne aucune valeur.
   */
  constructor(O_eventManager) {
    this.O_eventManager = O_eventManager;
    this.O_AfficheTemp = document.getElementById("tempList");
    this.O_AfficheTempExt = document.getElementById("tempExtList");
    this.O_HistoryTableBody = document.getElementById("historyList");
    this.O_HistoryTableBodyExt = document.getElementById("historyListExt");
    this.O_AfficheMesage = document.getElementById("message");
    this.F_boundUpdate = this.F_update.bind(this);

    this.O_eventManager.F_subscribe(this.F_boundUpdate);
  }

  /**
   * Reçoit l'état courant et déclenche le rendu de l'interface.
   * @param {Object} O_state - Objet O_state contenant I_currentTemperature, S_category et S_message.
   * @return {void} Ne retourne aucune valeur.
   */
  F_update(O_state) {
    this.F_displayCurrentTemperature(O_state);
    this.F_updateHistoryTable();
  }

  /**
   * Affiche les températures actuelle et extérieure et les messages associés.
   * @param {Object} O_state - Objet O_state contenant les données à afficher.
   * @return {void} Ne retourne aucune valeur.
   */
  F_displayCurrentTemperature(O_state) {
    // Affichage température intérieure
    if (O_state.I_currentTemperature !== null) {
      this.O_AfficheTemp.textContent = O_state.I_currentTemperature + " °C";
      this.O_AfficheTemp.setAttribute("class", O_state.S_category);
    }
    this.O_AfficheMesage.textContent = O_state.S_message;

    // Affichage température extérieure
    if (this.O_AfficheTempExt && O_state.I_currentTemperatureExt !== null) {
      this.O_AfficheTempExt.textContent =
        O_state.I_currentTemperatureExt + " °C";
      this.O_AfficheTempExt.setAttribute("class", O_state.S_categoryExt);
    }
  }

  /**
   * Met à jour le tableau de l'historique des températures.
   * @param {void} V_noParam - Aucun paramètre attendu pour F_updateHistoryTable.
   * @return {void} Ne retourne aucune valeur.
   */
  F_updateHistoryTable() {
    const A_History = this.O_eventManager.F_getHistory();

    this.O_HistoryTableBody.innerHTML = "";

    for (let I_i = 0; I_i < A_History.length; I_i++) {
      const O_entry = A_History[I_i];
      const O_row = this.O_HistoryTableBody.insertRow();
      const O_cellTime = O_row.insertCell(0);
      const O_cellTemp = O_row.insertCell(1);

      O_cellTime.textContent = O_entry.S_time;
      O_cellTemp.textContent = O_entry.I_temperature + " °C";

      if (O_entry.I_temperature < 0) {
        O_row.setAttribute("class", "bleue");
      } else if (O_entry.I_temperature >= 0 && O_entry.I_temperature <= 20) {
        O_row.setAttribute("class", "vert");
      } else if (O_entry.I_temperature > 20 && O_entry.I_temperature <= 30) {
        O_row.setAttribute("class", "orange");
      } else {
        O_row.setAttribute("class", "rouge");
      }
    }

    this.F_updateHistoryTableExt();
  }

  /**
   * Met à jour le tableau de l'historique des températures extérieures.
   * @param {void} V_noParam - Aucun paramètre attendu pour F_updateHistoryTableExt.
   * @return {void} Ne retourne aucune valeur.
   */
  F_updateHistoryTableExt() {
    const A_HistoryExt = this.O_eventManager.F_getHistoryExt();

    this.O_HistoryTableBodyExt.innerHTML = "";

    for (let I_i = 0; I_i < A_HistoryExt.length; I_i++) {
      const O_entry = A_HistoryExt[I_i];
      const O_row = this.O_HistoryTableBodyExt.insertRow();
      const O_cellTime = O_row.insertCell(0);
      const O_cellTemp = O_row.insertCell(1);

      O_cellTime.textContent = O_entry.S_time;
      O_cellTemp.textContent = O_entry.I_temperature + " °C";

      if (O_entry.I_temperature < 0) {
        O_row.setAttribute("class", "bleue");
      } else if (O_entry.I_temperature >= 0 && O_entry.I_temperature <= 15) {
        O_row.setAttribute("class", "vert");
      } else if (O_entry.I_temperature > 15 && O_entry.I_temperature <= 25) {
        O_row.setAttribute("class", "orange");
      } else {
        O_row.setAttribute("class", "rouge");
      }
    }
  }

  /**
   * Désabonne le composant des mises à jour de l'EventManager.
   * @param {void} V_noParam - Aucun paramètre attendu pour F_unsubscribe.
   * @return {void} Ne retourne aucune valeur.
   */
  F_unsubscribe() {
    this.O_eventManager.F_unsubscribe(this.F_boundUpdate);
  }
}
