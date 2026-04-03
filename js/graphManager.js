/* eslint-disable no-unused-vars */

class GraphManager {
  /**
   * Initialise le gestionnaire de graphiques et l'abonnement aux mises à jour.
   * @param {Object} O_eventManager - Instance O_eventManager émettant les changements d'état.
   * @return {void} Ne retourne aucune valeur.
   */
  constructor(O_eventManager) {
    this.O_eventManager = O_eventManager;
    this.O_canvasInterieur = document.getElementById("graphInterieur");
    this.O_canvasExterieur = document.getElementById("graphExterieur");
    this.O_chartInterieur = null;
    this.O_chartExterieur = null;
    this.F_boundUpdate = this.F_update.bind(this);

    this.O_eventManager.F_subscribe(this.F_boundUpdate);
    this.F_initGraphs();
  }

  /**
   * Initialise les graphiques Chart.js.
   * @param {void} V_noParam - Aucun paramètre attendu.
   * @return {void} Ne retourne aucune valeur.
   */
  F_initGraphs() {
    // Graphique température intérieure
    if (this.O_canvasInterieur) {
      const O_ctxInterieur = this.O_canvasInterieur.getContext("2d");
      this.O_chartInterieur = new Chart(O_ctxInterieur, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Température Intérieure (°C)",
              data: [],
              borderColor: "#ff6b6b",
              backgroundColor: "rgba(255, 107, 107, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: "Température (°C)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Heure",
              },
            },
          },
        },
      });
    }

    // Graphique température extérieure
    if (this.O_canvasExterieur) {
      const O_ctxExterieur = this.O_canvasExterieur.getContext("2d");
      this.O_chartExterieur = new Chart(O_ctxExterieur, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Température Extérieure (°C)",
              data: [],
              borderColor: "#4ecdc4",
              backgroundColor: "rgba(78, 205, 196, 0.1)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: "Température (°C)",
              },
            },
            x: {
              title: {
                display: true,
                text: "Heure",
              },
            },
          },
        },
      });
    }
  }

  /**
   * Reçoit l'état courant et met à jour les graphiques.
   * @param {Object} O_state - Objet O_state contenant les données à afficher.
   * @return {void} Ne retourne aucune valeur.
   */
  F_update(O_state) {
    this.F_updateGraphs();
  }

  /**
   * Met à jour les données des graphiques à partir de l'historique.
   * @param {void} V_noParam - Aucun paramètre attendu.
   * @return {void} Ne retourne aucune valeur.
   */
  F_updateGraphs() {
    const A_History = this.O_eventManager.F_getHistory();
    const A_HistoryExt = this.O_eventManager.F_getHistoryExt();

    // Mise à jour du graphique intérieur
    if (this.O_chartInterieur && A_History.length > 0) {
      const A_labels = A_History.map((O_entry) => O_entry.S_timeStart);
      const A_data = A_History.map((O_entry) => O_entry.I_temperature);

      this.O_chartInterieur.data.labels = A_labels;
      this.O_chartInterieur.data.datasets[0].data = A_data;
      this.O_chartInterieur.update();
    }

    // Mise à jour du graphique extérieur
    if (this.O_chartExterieur && A_HistoryExt.length > 0) {
      const A_labelsExt = A_HistoryExt.map((O_entry) => O_entry.S_timeStart);
      const A_dataExt = A_HistoryExt.map((O_entry) => O_entry.I_temperature);

      this.O_chartExterieur.data.labels = A_labelsExt;
      this.O_chartExterieur.data.datasets[0].data = A_dataExt;
      this.O_chartExterieur.update();
    }
  }
}

