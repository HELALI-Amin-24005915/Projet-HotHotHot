/* eslint-disable no-unused-vars */

class EventManager {
  /**
   * Initialise les températures simulées, l'historique et les abonnés.
   * @param {void} V_noParam - Aucun paramètre attendu pour le constructeur.
   * @return {void} Ne retourne aucune valeur.
   */
  constructor() {
    this.A_tempe = [];
    this.A_HistoireTemperatures = [];
    let I_temperatureValue;
    this.A_subscribers = [];
    this.O_state = {
      I_currentIndex: 0,
      I_currentTemperature: null,
      S_category: null,
      S_message: "",
    };

    for (let I_i = 0; I_i < 20; I_i++) {
      I_temperatureValue = Math.random() * (40 - -10) + -10;
      I_temperatureValue = Math.round(I_temperatureValue);
      this.A_tempe.push(I_temperatureValue);
    }
  }

  /**
   * Ajoute un abonné à notifier lors des mises à jour d'état.
   * @param {Function} F_callback - Fonction F_callback à appeler avec O_data.
   * @return {void} Ne retourne aucune valeur.
   */
  F_subscribe(F_callback) {
    this.A_subscribers.push(F_callback);
  }

  /**
   * Notifie tous les abonnés avec l'état courant.
   * @param {Object} O_data - Objet O_data contenant l'état à diffuser.
   * @return {void} Ne retourne aucune valeur.
   */
  F_notify(O_data) {
    for (let I_i = 0; I_i < this.A_subscribers.length; I_i++) {
      const F_callback = this.A_subscribers[I_i];
      F_callback(O_data);
    }
  }

  /**
   * Retire un abonné de la liste des notifications.
   * @param {Function} F_callback - Fonction F_callback à retirer des abonnés.
   * @return {void} Ne retourne aucune valeur.
   */
  F_unsubscribe(F_callback) {
    const A_updatedSubscribers = [];
    for (let I_i = 0; I_i < this.A_subscribers.length; I_i++) {
      const F_subscriber = this.A_subscribers[I_i];
      if (F_subscriber !== F_callback) {
        A_updatedSubscribers.push(F_subscriber);
      }
    }
    this.A_subscribers = A_updatedSubscribers;
  }

  /**
   * Retourne une température simulée à un index donné.
   * @param {number} I_index - Index I_index de la température dans A_tempe.
   * @return {number} Température trouvée à l'index demandé.
   */
  F_getTemperature(I_index) {
    return this.A_tempe[I_index];
  }

  /**
   * Ajoute une température à l'historique avec son horodatage.
   * @param {number} I_temperature - Valeur I_temperature à historiser.
   * @return {void} Ne retourne aucune valeur.
   */
  F_addToHistory(I_temperature) {
    const O_now = new Date();
    const S_time =
      O_now.getHours().toString().padStart(2, "0") +
      ":" +
      O_now.getMinutes().toString().padStart(2, "0") +
      ":" +
      O_now.getSeconds().toString().padStart(2, "0");
      
    this.A_HistoireTemperatures.push({
      I_temperature: I_temperature,
      S_time: S_time,
    });
  }

  /**
   * Retourne l'historique complet des températures.
   * @param {void} V_noParam - Aucun paramètre attendu pour F_getHistory.
   * @return {Array} Tableau A_HistoireTemperatures des entrées historisées.
   */
  F_getHistory() {
    return this.A_HistoireTemperatures;
  }

  /**
   * Met à jour l'état courant, calcule la catégorie et notifie les abonnés.
   * @param {void} V_noParam - Aucun paramètre attendu pour F_updateState.
   * @return {void} Ne retourne aucune valeur.
   */
  F_updateState() {
    this.O_state.I_currentIndex++;
    if (this.O_state.I_currentIndex >= this.A_tempe.length) {
      this.O_state.I_currentIndex = 0;
    }

    this.O_state.I_currentTemperature = this.A_tempe[this.O_state.I_currentIndex];
    this.F_addToHistory(this.O_state.I_currentTemperature);

    if (this.O_state.I_currentTemperature < 0) {
      this.O_state.S_category = "bleue";
      this.O_state.S_message = "Brrrrrrr, un peu froid ce matin, mets ta cagoule !";
    } else if (
      this.O_state.I_currentTemperature >= 0 &&
      this.O_state.I_currentTemperature <= 20
    ) {
      this.O_state.S_category = "vert";
      this.O_state.S_message = "";
    } else if (
      this.O_state.I_currentTemperature > 20 &&
      this.O_state.I_currentTemperature <= 30
    ) {
      this.O_state.S_category = "orange";
      this.O_state.S_message = "";
    } else {
      this.O_state.S_category = "rouge";
      this.O_state.S_message = "Caliente ! Vamos a la playa, ho hoho hoho ";
    }

    this.F_notify(this.O_state);
  }

  /**
   * Retourne l'état courant de température et d'affichage.
   * @param {void} V_noParam - Aucun paramètre attendu pour F_getState.
   * @return {Object} Objet O_state contenant index, température, catégorie et message.
   */
  F_getState() {
    return this.O_state;
  }
}