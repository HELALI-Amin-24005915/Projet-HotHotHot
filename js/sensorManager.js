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
          console.warn("⏱️ WebSocket timeout (3s) - pas de réponse");
          this.ws.close();
        }
      }, 3000);

      this.ws.onopen = () => {
        clearTimeout(this.wsTimeout);
        console.log("✅ WebSocket connecté");
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
        console.warn("❌ WebSocket indisponible");
        this.handleWebSocketError();
      };

      this.ws.onclose = () => {
        clearTimeout(this.wsTimeout);
        console.log("⚠️ WebSocket fermé");
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
      console.log("📡 Basculement vers AJAX...");
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
    console.log(
      `🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`,
    );

    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }

  /**
   * Récupère les données via AJAX (fallback)
   */
  fetchDataAjax() {
    // URL de l'API HotHotHot
    const url = "https://api.hothothot.dog/api/sensors";

    const reqXhr = new XMLHttpRequest();
    reqXhr.open("GET", url, true);
    reqXhr.setRequestHeader("Content-Type", "application/json");
    reqXhr.timeout = 5000; // Timeout 5 secondes

    console.log(`🌐 Tentative AJAX vers: ${url}`);

    reqXhr.onreadystatechange = () => {
      if (reqXhr.readyState === XMLHttpRequest.DONE) {
        if (reqXhr.status === 200) {
          try {
            const data = JSON.parse(reqXhr.responseText);
            console.log("✅ Données reçues via AJAX:", data);
            this.ajaxAttempts = 0; // Réinitialiser le compteur
            this.processData(data);
            // Renouveler la requête toutes les 5 secondes
            setTimeout(() => this.fetchDataAjax(), 5000);
          } catch (error) {
            console.error("❌ Erreur parsing JSON:", error);
            setTimeout(() => this.fetchDataAjax(), 5000);
          }
        } else {
          console.log(`⚠️ Status AJAX: ${reqXhr.status}`);
          // Renouveler en cas d'erreur
          setTimeout(() => this.fetchDataAjax(), 5000);
        }
      }
    };

    reqXhr.ontimeout = () => {
      console.warn("⏱️ Timeout AJAX (5s)");
      setTimeout(() => this.fetchDataAjax(), 5000);
    };

    reqXhr.onerror = () => {
      console.warn(`⚠️ Erreur AJAX: ${url}`);
      this.ajaxAttempts++;

      if (this.ajaxAttempts < 5) {
        console.warn(
          `⏳ Nouvelle tentative dans 5 secondes... (${this.ajaxAttempts}/5)`,
        );
        setTimeout(() => this.fetchDataAjax(), 5000);
      } else {
        console.error("❌ AJAX échoué après 5 tentatives");
        console.log(
          "💡 Vérifiez que l'API est accessible: https://api.hothothot.dog/api/sensors",
        );
      }
    };

    reqXhr.send();
  }

  /**
   * Traite les données reçues (supporte plusieurs formats)
   */
  processData(data) {
    console.log("🔍 Traitement des données:", data);

    // Format HotHotHot API: {"capteurs":[{"Nom":"interieur","Valeur":"16.4"},{"Nom":"exterieur","Valeur":"9.5"}]}
    if (data.capteurs && Array.isArray(data.capteurs)) {
      for (const capteur of data.capteurs) {
        const nom = capteur.Nom.toLowerCase();
        const valeur = parseFloat(capteur.Valeur);

        // Afficher la température intérieure par défaut
        if (nom.includes("interieur") || nom.includes("int")) {
          console.log(`📍 Capteur intérieur: ${valeur}°C`);
          console.log("📤 Appel F_updateState avec:", valeur);
          this.eventManager.F_updateState(valeur);
        } else if (nom.includes("exterieur") || nom.includes("ext")) {
          console.log(`📍 Capteur extérieur: ${valeur}°C`);
          // On peut aussi traiter l'extérieur si besoin
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
      console.log("📤 Appel F_updateState avec:", temperature);
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

      indicator.innerHTML = `${icon} Mode: <strong>${text}</strong>`;
    }
  }
}
