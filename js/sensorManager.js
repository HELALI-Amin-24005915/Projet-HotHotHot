/**
 * Gestionnaire de données en temps réel
 * WebSocket avec fallback AJAX
 */

class SensorManager {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 2; // Réduit de 5 à 2 pour aller plus vite en AJAX
    this.reconnectDelay = 1000; // Réduit de 2000 à 1000ms
    this.connectionMode = "Initialisation...";
    this.isUsingWebSocket = false;
    this.isUsingAjax = false;
    this.wsTimeout = null;
    this.ajaxAttempts = 0;

    // Essayer de se connecter en WebSocket
    this.connectWebSocket();
  }

  /**
   * Connecte le WebSocket
   */
  connectWebSocket() {
    try {
      this.ws = new WebSocket("wss://ws.hothothot.dog:9502");

      // Timeout 3 secondes pour WebSocket
      this.wsTimeout = setTimeout(() => {
        if (
          !this.isConnected &&
          this.ws &&
          this.ws.readyState === WebSocket.CONNECTING
        ) {
          console.warn("WebSocket timeout");
          this.ws.close();
        }
      }, 3000);

      this.ws.onopen = () => {
        clearTimeout(this.wsTimeout);
        console.log("WebSocket connected");
        this.isConnected = true;
        this.isUsingWebSocket = true;
        this.isUsingAjax = false;
        this.reconnectAttempts = 0;
        this.connectionMode = "WebSocket";
        this.updateConnectionDisplay();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.processData(data);
      };

      this.ws.onerror = (error) => {
        console.warn("WebSocket error");
        this.handleWebSocketError();
      };

      this.ws.onclose = () => {
        clearTimeout(this.wsTimeout);
        console.log("WebSocket closed");
        this.isConnected = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Erreur connexion WebSocket:", error);
      this.handleWebSocketError();
    }
  }

  /**
   * Gère les erreurs WebSocket
   */
  handleWebSocketError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    } else {
      console.log("Basculement vers AJAX...");
      this.isUsingWebSocket = false;
      this.isUsingAjax = true;
      this.connectionMode = "AJAX";
      this.updateConnectionDisplay();
      // Lancer AJAX immédiatement
      this.fetchDataAjax();
    }
  }

  /**
   * Tente de reconnecter au WebSocket
   */
  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Récupère les données via AJAX (fallback)
   */
  fetchDataAjax() {
    // URL de l'API HotHotHot avec proxy CORS
    const apiUrl = "https://api.hothothot.dog/api/sensors";
    const proxyUrl =
      "https://api.allorigins.win/get?url=" + encodeURIComponent(apiUrl);

    fetch(proxyUrl)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 429) {
          throw new Error("Rate limit");
        }
        throw new Error("HTTP error");
      })
      .then((data) => {
        const contents = JSON.parse(data.contents);
        this.ajaxAttempts = 0;
        this.processData(contents);
        setTimeout(() => this.fetchDataAjax(), 20000);
      })
      .catch((error) => {
        if (error.message === "Rate limit") {
          console.warn("Rate limit atteint, attente 30s...");
          setTimeout(() => this.fetchDataAjax(), 30000);
        } else {
          this.ajaxAttempts++;
          if (this.ajaxAttempts < 5) {
            setTimeout(() => this.fetchDataAjax(), 20000);
          } else {
            console.error("AJAX failed after 5 attempts");
          }
        }
      });
  }

  /**
   * Traite les données reçues (supporte plusieurs formats)
   */
  processData(data) {
    // Format HotHotHot API: {"capteurs":[{"Nom":"interieur","Valeur":"16.4"},{"Nom":"exterieur","Valeur":"9.5"}]}
    if (data.capteurs && Array.isArray(data.capteurs)) {
      for (const capteur of data.capteurs) {
        const nom = capteur.Nom.toLowerCase();
        const valeur = parseFloat(capteur.Valeur);

        if (nom.includes("interieur") || nom.includes("int")) {
          this.eventManager.F_updateState(valeur);
        } else if (nom.includes("exterieur") || nom.includes("ext")) {
          this.eventManager.F_updateStateExt(valeur);
        }
      }
      return;
    }

    // Autres formats (backward compatibility)
    let temperature = null;

    if (data.temperature_ext !== undefined) {
      temperature = data.temperature_ext;
    } else if (data.temp_ext !== undefined) {
      temperature = data.temp_ext;
    } else if (data.temperature !== undefined) {
      temperature = data.temperature;
    } else if (data.temp !== undefined) {
      temperature = data.temp;
    } else if (data.temperature_int !== undefined) {
      temperature = data.temperature_int;
    }

    if (temperature !== null) {
      this.eventManager.F_updateState(temperature);
    }
  }

  /**
   * Met à jour l'affichage du mode de connexion sur la page
   */
  updateConnectionDisplay() {
    const indicator = document.getElementById("connection-mode");
    if (indicator) {
      let text = "Hors ligne";

      if (this.isUsingWebSocket) {
        text = "WebSocket";
      } else if (this.isUsingAjax) {
        text = "AJAX";
      }

      indicator.innerHTML = `Mode: <strong>${text}</strong>`;
    }
  }
}
