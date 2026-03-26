/* eslint-disable no-unused-vars */

class HistoryManager {
  /**
   * Initialise le gestionnaire d'historique et s'abonne aux mises à jour.
   * @param {Object} O_eventManager - Instance O_eventManager utilisée pour les notifications.
   * @return {void} Ne retourne aucune valeur.
   */
  constructor(O_eventManager) {
    this.O_eventManager = O_eventManager;
    this.O_tableBody = document.getElementById("historyList");

    if (!this.O_tableBody) {
      console.error(
        "L'élément 'historyList' (tbody) n'a pas été trouvé dans le DOM",
      );
      return;
    }

    this.O_eventManager.F_subscribe(this.F_update.bind(this));
  }

  /**
   * Ajoute une ligne de température dans le tableau d'historique.
   * @param {number} I_temperature - Température I_temperature à ajouter.
   * @return {void} Ne retourne aucune valeur.
   */
  F_addRowToTable(I_temperature) {
    const O_row = this.O_tableBody.insertRow();
    const O_cellTemperature = O_row.insertCell(0);
    O_cellTemperature.textContent = `${I_temperature} °C`;

    const O_cellTime = O_row.insertCell(1);
    const O_date = new Date();
    O_cellTime.textContent = O_date.toLocaleTimeString("fr-FR");
  }

  /**
   * Traite une notification d'état et met à jour l'historique.
   * @param {Object} O_data - Objet O_data contenant la propriété I_currentTemperature.
   * @return {void} Ne retourne aucune valeur.
   */
  F_update(O_data) {
    const I_temperature = O_data.I_currentTemperature;
    this.F_addRowToTable(I_temperature);
  }
}