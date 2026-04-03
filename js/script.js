/* global EventManager, TemperatureDisplay, SensorManager */
/* eslint-disable no-unused-vars */

const O_EM = new EventManager();

const O_temperatureDisplay = new TemperatureDisplay(O_EM);

const O_sensorManager = new SensorManager(O_EM);
O_sensorManager.F_startSimulation();

// --- Seuils d'alerte par défaut (modifiable depuis la console)
// Intérieur: min 18°C, max 28°C
O_EM.F_setAlertThresholds(18, 28);
// Extérieur: min 0°C, max 35°C
O_EM.F_setAlertThresholdsExt(0, 35);

// Fonction utilitaire pour tester les notifications depuis la console :
// appeler `HH_testNotifications()` pour simuler des franchissements de seuils
window.HH_testNotifications = function HH_testNotifications() {
  console.log('Simulation notifications: intérieur -> 17 puis 29 ; extérieur -> -1 puis 40');
  O_EM.F_updateState(17);
  setTimeout(() => O_EM.F_updateState(29), 1500);
  setTimeout(() => O_EM.F_updateStateExt(-1), 3000);
  setTimeout(() => O_EM.F_updateStateExt(40), 4500);
};

// --- Controls pour forcer WS/AJAX
window.addEventListener('load', function F_onLoad() {
  const O_connIndicator = document.getElementById('connection-mode');


  // Mise à jour périodique de l'indicateur
  setInterval(() => {
    if (!O_connIndicator) return;
    if (O_sensorManager.B_isUsingWebSocket) {
      O_connIndicator.innerHTML = 'Mode: <strong>WebSocket</strong>';
    } else if (O_sensorManager.B_isUsingAjax) {
      O_connIndicator.innerHTML = 'Mode: <strong>AJAX</strong>';
    } else {
      O_connIndicator.innerHTML = 'Mode: <strong>Recherche de connexion...</strong>';
    }
  }, 1000);
});

let O_deferredInstallPrompt = null;
const O_installButton = document.getElementById('btn-install');

function F_isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
  );
}

function F_toggleInstallButton(B_show) {
  if (!O_installButton) {
    return;
  }

  O_installButton.style.display = B_show ? 'inline-block' : 'none';
}

function F_setupInstallPrompt() {
  if (!O_installButton) {
    return;
  }

  if (F_isStandaloneMode() === true) {
    F_toggleInstallButton(false);
    return;
  }

  window.addEventListener('beforeinstallprompt', function F_onBeforeInstallPrompt(O_event) {
    O_event.preventDefault();
    O_deferredInstallPrompt = O_event;
    F_toggleInstallButton(true);
  });

  O_installButton.addEventListener('click', async function F_onInstallClick() {
    if (!O_deferredInstallPrompt) {
      console.warn('Installation PWA non disponible pour le moment.');
      return;
    }

    O_deferredInstallPrompt.prompt();
    const O_result = await O_deferredInstallPrompt.userChoice;
    console.log('Choix installation PWA:', O_result.outcome);
    O_deferredInstallPrompt = null;
    F_toggleInstallButton(false);
  });

  window.addEventListener('appinstalled', function F_onAppInstalled() {
    console.log('PWA installée avec succès');
    O_deferredInstallPrompt = null;
    F_toggleInstallButton(false);
  });
}

function F_registerServiceWorker() {
  // Ne pas enregistrer le ServiceWorker en dev (IP, localhost) pour éviter erreurs de fetch et cache stale
  try {
    const S_host = window && window.location && window.location.hostname;
    const A_prodHosts = ['hothothot.dog', 'www.hothothot.dog'];
    const R_ipv4 = /^\d+\.\d+\.\d+\.\d+$/;
    if (R_ipv4.test(S_host) || S_host === 'localhost' || !A_prodHosts.includes(S_host)) {
      console.log('ServiceWorker registration skipped in non-production host:', S_host);
      return;
    }
  } catch (e) {
    // si erreur, continuer mais tenter d'enregistrer le SW
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function F_loadSW() {
      this.navigator.serviceWorker.register('./sw.js')
      .then(function F_onSuccess(O_registration) {
        console.log('Le ServiceWorker est enregistré: ', O_registration.scope);
      })
      .catch(function F_onError(O_error) {
        console.log('L\'enregistrement du ServiceWorker a échoué: ', O_error);
      });
    });
  }
}

F_registerServiceWorker();
F_setupInstallPrompt();

