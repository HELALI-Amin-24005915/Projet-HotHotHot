/* exported SensorManager */
/**
 * Gestionnaire de données en temps réel
 * WebSocket avec fallback AJAX
 */

class SensorManager {
  constructor(O_eventManager = null) {
    this.O_eventManager = O_eventManager;
    this.O_ws = null;
    this.B_isConnected = false;
    this.I_reconnectAttempts = 0;
    this.I_maxReconnectAttempts = 8; // augmenter tentatives pour résilience
    this.I_reconnectDelay = 1000;
    this.S_connectionMode = "Initialisation...";
    this.B_isUsingWebSocket = false;
    this.B_isUsingAjax = false;
    this.O_wsTimeout = null;
    this.I_ajaxAttempts = 0;
    this.B_isSimulationStarted = false;
    this.B_isWebSocketFailureHandled = false;
    this.O_reconnectTimer = null;
  }

  /**
   * Démarre la simulation de réception de données capteurs.
   * @return {void} Ne retourne aucune valeur.
   */
  F_startSimulation() {
    if (this.B_isSimulationStarted === true) {
      return;
    }
    this.B_isSimulationStarted = true;
    // Démarrage direct : tenter la connexion WebSocket immédiatement.
    // Le code de gestion d'erreur et de reconnexion (handleWebSocketError/F_scheduleReconnect)
    // s'occupera du basculement vers AJAX si le serveur n'est pas joignable.
    console.log('SensorManager: starting simulation — attempting WebSocket connection');
    this.connectWebSocket();
  }

  /**
   * Connecte le WebSocket
   */
  connectWebSocket() {
    if (this.B_isUsingAjax === true) {
      return;
    }

    this.B_isWebSocketFailureHandled = false;

    try {
      console.log('SensorManager: attempting WebSocket connection to wss://ws.hothothot.dog:9502');
      this.O_ws = new WebSocket("wss://ws.hothothot.dog:9502");

      // Timeout augmenté à 15s pour des réseaux lents / TLS handshake
      this.O_wsTimeout = setTimeout(() => {
        if (
          this.B_isConnected === false &&
          this.O_ws &&
          this.O_ws.readyState === WebSocket.CONNECTING
        ) {
          console.warn("WebSocket timeout (readyState=", this.O_ws.readyState, ") - closing socket", this.O_ws.url);
          try {
            this.O_ws.close();
          } catch (e) {
            console.error('Error closing timed-out WebSocket', e);
          }
        }
      }, 15000);

      // NOTE: If you see frequent timeouts, increase the delay above (e.g. 8000 ms)
      // or check network / TLS issues on the server side

      this.O_ws.onopen = () => {
        clearTimeout(this.O_wsTimeout);
        console.log("WebSocket connected ✓");
        this.B_isWebSocketFailureHandled = false;
        this.B_isConnected = true;
        this.B_isUsingWebSocket = true;
        this.B_isUsingAjax = false;
        this.I_reconnectAttempts = 0;
        this.S_connectionMode = "WebSocket";
        this.updateConnectionDisplay();
        // Demande les données de température au serveur
        this.O_ws.send("getTemperature");
        console.log("Message 'getTemperature' sent ✓");
      };

      this.O_ws.onmessage = (O_event) => {
        console.log("📨 Message reçu du serveur:", O_event.data);
        try {
          const O_data = JSON.parse(O_event.data);
          console.log("📊 Données parsées:", O_data);
          this.processData(O_data);
        } catch (e) {
          console.error("❌ Erreur parsing JSON:", e, "Données brutes:", O_event.data);
        }
      };

      this.O_ws.onerror = (O_event) => {
        clearTimeout(this.O_wsTimeout);
        console.warn("WebSocket error - readyState=", this.O_ws && this.O_ws.readyState, O_event);
        this.handleWebSocketError();
      };

      this.O_ws.onclose = (O_event) => {
        clearTimeout(this.O_wsTimeout);
        try {
          console.log("WebSocket closed - code:", O_event && O_event.code, "reason:", O_event && O_event.reason, "wasClean:", O_event && O_event.wasClean);
        } catch (e) {
          console.log('WebSocket closed');
        }
        this.B_isConnected = false;
        this.handleWebSocketError();
      };
    } catch (O_error) {
      console.error("Erreur connexion WebSocket:");
      console.error(O_error);
      this.handleWebSocketError();
    }
  }

  /**
   * Gère les erreurs WebSocket
   */
  handleWebSocketError() {
    // Si le WebSocket échoue, on regarde s'il faut passer hors ligne (ou utiliser le Mock)
    this.F_handleConnectionError();

    if (this.B_isUsingAjax === true || this.B_isWebSocketFailureHandled === true) {
      return;
    }

    this.B_isWebSocketFailureHandled = true;

    if (this.I_reconnectAttempts < this.I_maxReconnectAttempts) {
      this.F_scheduleReconnect();
    } else {
      this.F_activateAjaxFallback();
    }
  }

  /**
   * Tente de reconnecter au WebSocket
   */
  F_scheduleReconnect() {
    this.I_reconnectAttempts++;
    const I_delay = this.I_reconnectDelay * this.I_reconnectAttempts;

    this.O_reconnectTimer = setTimeout(() => {
      this.connectWebSocket();
    }, I_delay);
  }

  /**
   * Active le mode AJAX et arrête les tentatives WebSocket.
   * @return {void} Ne retourne aucune valeur.
   */
  F_activateAjaxFallback() {
    console.log("Basculement vers AJAX...");
    this.B_isUsingWebSocket = false;
    this.B_isUsingAjax = true;
    this.S_connectionMode = "AJAX";
    this.updateConnectionDisplay();

    if (this.O_reconnectTimer) {
      clearTimeout(this.O_reconnectTimer);
      this.O_reconnectTimer = null;
    }

    this.fetchDataAjax();
  }

  /**
   * Récupère les données via AJAX (fallback)
   */
  fetchDataAjax() {
    // URL de l'API HotHotHot avec proxy CORS
    const S_apiUrl = "https://api.hothothot.dog/api/sensors";
    const S_proxyUrl =
      "https://api.allorigins.win/get?url=" + encodeURIComponent(S_apiUrl);

    fetch(S_proxyUrl)
      .then((O_response) => {
        if (O_response.ok) {
          return O_response.json();
        } else if (O_response.status === 429) {
          throw new Error("Rate limit");
        }
        throw new Error("HTTP error");
      })
      .then((O_data) => {
        const O_contents = JSON.parse(O_data.contents);
        this.I_ajaxAttempts = 0;
        this.processData(O_contents);
        setTimeout(() => this.fetchDataAjax(), 20000);
      })
      .catch((O_error) => {
        console.error(O_error);
        if (O_error.message === "Rate limit") {
          console.warn("Rate limit atteint, attente 30s...");
          setTimeout(() => this.fetchDataAjax(), 30000);
        } else {
          this.I_ajaxAttempts++;
          this.F_handleConnectionError();
          
          if (this.I_ajaxAttempts < 5) {
            setTimeout(() => this.fetchDataAjax(), 20000);
          } else {
            console.error("AJAX failed after 5 attempts");
          }
        }
      });
  }


  processData(O_data) {
    this.F_saveDataOffline(O_data);

    if (O_data.capteurs && Array.isArray(O_data.capteurs)) {
      for (let I_i = 0; I_i < O_data.capteurs.length; I_i++) {
        const O_capteur = O_data.capteurs[I_i];
        const S_nom = O_capteur.Nom.toLowerCase();
        const I_valeur = parseFloat(O_capteur.Valeur);

        if (S_nom.includes("interieur") || S_nom.includes("int")) {
          if (this.O_eventManager) {
            this.O_eventManager.F_updateState(I_valeur);
          }
        } else if (S_nom.includes("exterieur") || S_nom.includes("ext")) {
          if (this.O_eventManager && this.O_eventManager.F_updateStateExt) {
            this.O_eventManager.F_updateStateExt(I_valeur);
          }
        }
      }
      return;
    }

    // Autres formats (backward compatibility)
    let I_temperature = null;

    if (O_data.temperature_ext !== undefined) {
      I_temperature = O_data.temperature_ext;
    } else if (O_data.temp_ext !== undefined) {
      I_temperature = O_data.temp_ext;
    } else if (O_data.temperature !== undefined) {
      I_temperature = O_data.temperature;
    } else if (O_data.temp !== undefined) {
      I_temperature = O_data.temp;
    } else if (O_data.temperature_int !== undefined) {
      I_temperature = O_data.temperature_int;
    }

    if (I_temperature !== null && this.O_eventManager) {
      this.O_eventManager.F_updateState(I_temperature);
    }
  }

  /**
   * Met à jour l'affichage du mode de connexion sur la page
   */
  updateConnectionDisplay() {
    const O_indicator = document.getElementById("connection-mode");
    if (O_indicator) {
      let S_text = "Hors ligne";

      if (this.B_isUsingWebSocket) {
        S_text = "WebSocket";
      } else if (this.B_isUsingAjax) {
        S_text = "AJAX";
      }

      O_indicator.innerHTML = `Mode: <strong>${S_text}</strong>`;
    }
  }

  /**
   * Sauvegarde les données dans le navigateur (Exigence Lot 3)
   * @param {Object} O_data - Les données à sauvegarder
   * @return {void}
   */
  F_saveDataOffline(O_data) {
    const S_jsonData = JSON.stringify(O_data);
    window.localStorage.setItem('S_lastTempData', S_jsonData);
  }

  /**
   * L'Aiguilleur : décide quoi faire quand une erreur réseau arrive.
   * @return {void}
   */
  F_handleConnectionError() {
    if (navigator.onLine === false) {
      // Coupure Wi-Fi, on tente de charger les données de secours
      this.F_loadOfflineData();
    } else {
      // Wi-Fi OK, mais serveur HS (On met les données du prof)
      this.F_useMockData();
    }
  }

  /**
   * Récupère les données de secours si on est hors ligne
   * @return {void}
   */
  F_loadOfflineData() {
    console.log("Mode hors ligne détecté. Lecture du localStorage...");
    const S_savedData = window.localStorage.getItem('S_lastTempData');

    if (S_savedData !== null) {
      const O_data = JSON.parse(S_savedData);
      console.log("Données de secours trouvées :", O_data);
      this.processData(O_data);
    } else {
      console.warn("Aucune donnée de secours disponible.");
    }
  }

  /**
   * Utilise les données du prof quand le serveur est en panne.
   * @return {void}
   */
  F_useMockData() {
    console.log("Serveur distant HS. Utilisation des données du professeur...");
    const O_profData = {
      "HotHotHot": "Api v1.0",
      "capteurs": [
        {"type": "Thermique", "Nom": "interieur", "Valeur": "18.1", "Timestamp": 1774500791},
        {"type": "Thermique", "Nom": "exterieur", "Valeur": "5.9", "Timestamp": 1774500791}
      ]
    };
    // On sauvegarde en local puis on affiche
    this.F_saveDataOffline(O_profData);
    this.processData(O_profData); 
  }
}

window.SensorManager = SensorManager;

