/* NotificationManager pour HotHotHot
   - Utilise la Web Notification API si autorisée
   - Sinon affiche un petit toast fallback
   - Fournit notifyIfThresholdExceeded(...) pour détecter franchissements de seuils
*/
class NotificationManager {
  constructor() {
    this.B_isSupported = 'Notification' in window;
    this.O_container = null;
    this.O_lastSent = {}; // cooldown par clé
    this.I_cooldown = 5 * 60 * 1000; // 5 minutes

    this._ensureContainer();

    // Demander la permission au chargement (peut être modifié si vous préférez attendre un geste utilisateur)
    if (this.B_isSupported && Notification.permission === 'default') {
      try { Notification.requestPermission().then(() => {}); } catch (e) { /* ignore */ }
    }
  }

  _ensureContainer() {
    if (this.O_container) return;

    this.O_container = document.createElement('div');
    this.O_container.id = 'hh-notification-container';
    document.body.appendChild(this.O_container);

    const S_css = `
#hh-notification-container {
  position: fixed;
  right: 16px;
  top: 16px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.hh-toast {
  pointer-events: auto;
  min-width: 220px;
  max-width: 320px;
  background: rgba(0,0,0,0.85);
  color: white;
  padding: 10px 12px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.3);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  font-size: 13px;
}
.hh-toast strong { display:block; margin-bottom:4px; }
`;
    const O_style = document.createElement('style');
    O_style.textContent = S_css;
    document.head.appendChild(O_style);
  }

  _canSend(key) {
    const I_now = Date.now();
    if (!this.O_lastSent[key]) return true;
    return I_now - this.O_lastSent[key] > this.I_cooldown;
  }

  _markSent(key) {
    this.O_lastSent[key] = Date.now();
  }

  notify(S_title, S_body, O_options = {}) {
    // Si Notification API supportée et permission accordée
    if (this.B_isSupported && Notification.permission === 'granted') {
      try {
        new Notification(S_title, Object.assign({ body: S_body }, O_options));
        return;
      } catch (e) {
        // fallback to toast
        this._showToast(S_title, S_body);
      }
    } else {
      // Afficher toast fallback
      this._showToast(S_title, S_body);
    }
  }

  _showToast(S_title, S_body) {
    this._ensureContainer();
    const O_toast = document.createElement('div');
    O_toast.className = 'hh-toast';
    const O_title = document.createElement('strong');
    O_title.textContent = S_title;
    const O_body = document.createElement('div');
    O_body.textContent = S_body;
    O_toast.appendChild(O_title);
    O_toast.appendChild(O_body);

    this.O_container.appendChild(O_toast);

    setTimeout(() => {
      O_toast.style.transition = 'opacity 300ms, transform 300ms';
      O_toast.style.opacity = '0';
      O_toast.style.transform = 'translateX(10px)';
    }, 5200);

    setTimeout(() => {
      if (O_toast.parentNode) O_toast.parentNode.removeChild(O_toast);
    }, 5600);
  }

  /**
   * Vérifie si un seuil est franchi et envoie une notification si nécessaire.
   * Paramètre O_opts attendu : { type: 'int'|'ext', prev: number|null, current: number, min: number, max: number }
   */
  notifyIfThresholdExceeded(O_opts) {
    if (!O_opts || typeof O_opts.current !== 'number') return;
    const S_type = O_opts.type || 'int';
    const I_prev = (typeof O_opts.prev === 'number') ? O_opts.prev : null;
    const I_current = O_opts.current;
    const I_min = (typeof O_opts.min === 'number') ? O_opts.min : null;
    const I_max = (typeof O_opts.max === 'number') ? O_opts.max : null;

    // Clés de cooldown
    const S_keyLow = `${S_type}-low`;
    const S_keyHigh = `${S_type}-high`;

    // Si min défini et franchi vers le bas
    if (I_min !== null) {
      const B_crossedDown = (I_prev === null) ? (I_current < I_min) : (I_prev >= I_min && I_current < I_min);
      if (B_crossedDown && this._canSend(S_keyLow)) {
        const S_title = S_type === 'int' ? 'Température intérieure basse' : 'Température extérieure basse';
        const S_body = `La température est passée en-dessous de ${I_min}°C (${I_current}°C).`;
        this.notify(S_title, S_body);
        this._markSent(S_keyLow);
      }
    }

    // Si max défini et franchi vers le haut
    if (I_max !== null) {
      const B_crossedUp = (I_prev === null) ? (I_current > I_max) : (I_prev <= I_max && I_current > I_max);
      if (B_crossedUp && this._canSend(S_keyHigh)) {
        const S_title = S_type === 'int' ? 'Température intérieure élevée' : 'Température extérieure élevée';
        const S_body = `La température a atteint ${I_max}°C (${I_current}°C).`;
        this.notify(S_title, S_body);
        this._markSent(S_keyHigh);
      }
    }
  }
}

window.NotificationManager = new NotificationManager();
