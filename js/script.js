/* global EventManager, TemperatureDisplay, SensorManager */
/* eslint-disable no-unused-vars */

const O_EM = new EventManager();

const O_temperatureDisplay = new TemperatureDisplay(O_EM);

const O_sensorManager = new SensorManager(O_EM);
O_sensorManager.F_startSimulation();

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
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function F_loadSW() {
      this.navigator.serviceWorker.register('/sw.js')
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

