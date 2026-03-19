/* eslint-disable no-unused-vars */

class EventManager {
  constructor() {
    this.A_tempe = [];
    this.A_HistoireTemperatures = [];
    let I_t;
    this.A_subscribers = [];
    this.state = {
      currentIndex: 0,
      currentTemperature: null,
      category: null,
      message: "",
    };

    for (let I_i = 0; I_i < 20; I_i++) {
      I_t = Math.random() * (40 - -10) + -10; // car Math.random() génère entre 0 et 1 donc pour avoir entre -10 et 40
      I_t = Math.round(I_t);
      this.A_tempe.push(I_t);
    }
  }

  subscribe(F_callback) {
    this.A_subscribers.push(F_callback);
  }

  notify(O_data) {
    this.A_subscribers.forEach((F_callback) => F_callback(O_data));
  }

  unsubscribe(F_callback) {
    this.A_subscribers = this.A_subscribers.filter(
      (F_sub) => F_sub !== F_callback,
    );
  }

  getTemperature(I_index) {
    return this.A_tempe[I_index];
  }

  addToHistory(I_temperature) {
    const O_now = new Date();
    const S_time =
      O_now.getHours().toString().padStart(2, "0") +
      ":" +
      O_now.getMinutes().toString().padStart(2, "0") +
      ":" +
      O_now.getSeconds().toString().padStart(2, "0");
      
    this.A_HistoireTemperatures.push({
      temperature: I_temperature,
      time: S_time,
    });
  }

  getHistory() {
    return this.A_HistoireTemperatures;
  }

  updateState() {
    this.state.currentIndex++;
    if (this.state.currentIndex >= this.A_tempe.length) {
      this.state.currentIndex = 0;
    }

    this.state.currentTemperature = this.A_tempe[this.state.currentIndex];
    this.addToHistory(this.state.currentTemperature);

    // Déterminer la catégorie et le message selon la température
    if (this.state.currentTemperature < 0) {
      this.state.category = "bleue";
      this.state.message = "Brrrrrrr, un peu froid ce matin, mets ta cagoule !";
    } else if (
      this.state.currentTemperature >= 0 &&
      this.state.currentTemperature <= 20
    ) {
      this.state.category = "vert";
      this.state.message = "";
    } else if (
      this.state.currentTemperature > 20 &&
      this.state.currentTemperature <= 30
    ) {
      this.state.category = "orange";
      this.state.message = "";
    } else {
      this.state.category = "rouge";
      this.state.message = "Caliente ! Vamos a la playa, ho hoho hoho ";
    }

    // Notifier tous les observers avec le nouvel état
    this.notify(this.state);
  }

  getState() {
    return this.state;
  }
}