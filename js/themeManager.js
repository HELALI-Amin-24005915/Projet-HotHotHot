/**
 * Theme Manager - Gère le basculement entre le mode sombre et le mode tigre
 */

class ThemeManager {
    constructor() {
        this.themeName = 'tiger-mode';
        this.storageKey = 'theme-preference';
        this.init();
    }

    init() {
        // Charger le thème sauvegardé
        const savedTheme = localStorage.getItem(this.storageKey);
        if (savedTheme === 'tiger') {
            this.enableTigerMode();
        } else {
            this.disableTigerMode();
        }

        // Ajouter l'event listener au toggle
        const toggle = document.getElementById('theme-toggle-input');
        if (toggle) {
            toggle.addEventListener('change', () => {
                if (toggle.checked) {
                    this.enableTigerMode();
                } else {
                    this.disableTigerMode();
                }
            });
        }
    }

    enableTigerMode() {
        document.body.classList.add(this.themeName);
        localStorage.setItem(this.storageKey, 'tiger');
        const toggle = document.getElementById('theme-toggle-input');
        if (toggle) {
            toggle.checked = true;
        }
    }

    disableTigerMode() {
        document.body.classList.remove(this.themeName);
        localStorage.setItem(this.storageKey, 'dark');
        const toggle = document.getElementById('theme-toggle-input');
        if (toggle) {
            toggle.checked = false;
        }
    }
}

// Initialiser le ThemeManager au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
    });
} else {
    new ThemeManager();
}

