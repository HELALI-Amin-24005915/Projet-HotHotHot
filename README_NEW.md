# 🔥 HotHotHot - Système de Gestion Domotique

## Vue d'ensemble

HotHotHot est une application web progressive (PWA) conçue pour monitorer et gérer un système domotique en temps réel. Elle affiche les données de capteurs de température (intérieur/extérieur), leur historique, et envoie des alertes intelligentes.

## Fonctionnalités

### Lot 1 - Interface HTML/CSS/JS Responsive

- ✅ Navigation responsive avec menu mobile
- ✅ Système d'onglets pour les données temps réel et historique
- ✅ Page de documentation avec équipe et planning
- ✅ Page de gestion de compte
- ✅ Design moderne et accessible (ARIA)
- ✅ Custom Elements pour l'affichage des capteurs (Shadow DOM)
- ✅ Templates HTML pour génération dynamique

### Lot 2 - Système d'Alertes

- ✅ Alertes basées sur les seuils des capteurs
- ✅ Boîte de dialogue avec historique des alertes
- ✅ Notifications push système
- ✅ Synthèse journalière (min/max)

### Lot 3 - Progressive Web App (PWA)

- ✅ Service Worker avec stratégie de cache
- ✅ Mode installation sur l'écran d'accueil
- ✅ Fonctionnement hors ligne
- ✅ Cache IndexedDB pour les données
- ✅ Manifest.json complet

## Architecture

L'application suit une architecture MVC avec Design Patterns :

```
js/
├── components/          # Custom Elements
│   ├── sensor-display.js
│   └── alert-system.js
├── services/           # Services métier
│   ├── websocket-service.js
│   ├── chart-service.js
│   └── pwa-service.js
├── controllers/        # Contrôleurs (MVC)
│   ├── ui-controller.js
│   └── data-controller.js
├── utils/             # Utilitaires
│   ├── logger.js
│   └── db.js
└── app.js             # Point d'entrée
```

### Design Patterns Utilisés

- **Observer Pattern** : Pour les abonnements aux alertes
- **MVC** : Séparation Model-View-Controller
- **Singleton** : Instances globales des services
- **Factory** : Création de composants Shadow DOM

## Installation et Démarrage

### Prérequis

- Node.js (pour serveur HTTPS local)
- Navigateur moderne supportant PWA, WebSocket, Shadow DOM

### Installation Locale

1. **Cloner le dépôt**

```bash
git clone https://github.com/HELALI-Amin-24005915/Projet-HotHotHot.git
cd Projet-HotHotHot
```

2. **Démarrer un serveur HTTPS local**

```bash
# Avec Python 3
python3 -m http.server --cgi 8000

# Ou avec Node.js + http-server
npx http-server --ssl --cert localhost.crt --key localhost.key
```

3. **Accéder à l'application**

```
https://localhost:8000
```

> Note : Vous devrez accepter le certificat auto-signé

## Connexion aux Capteurs

L'application se connecte automatiquement au serveur WebSocket :

```
wss://ws.hothothot.dog:9502
```

Format des données attendues :

```json
{
  "sensorType": "ext" | "int",
  "value": 25.5,
  "timestamp": 1609459200000
}
```

## Alertes et Seuils

| Condition                     | Type    | Message                   |
| ----------------------------- | ------- | ------------------------- |
| Température extérieure > 35°C | Danger  | Hot Hot Hot ! 🔥          |
| Température extérieure < 0°C  | Warning | Banquise en vue ! ❄️      |
| Température intérieure > 50°C | Danger  | Appelez les pompiers ! 🚒 |
| Température intérieure > 22°C | Warning | Baissez le chauffage !    |
| Température intérieure < 12°C | Warning | Montez le chauffage ! 🧥  |
| Température intérieure < 0°C  | Danger  | Canalisations gelées ! 🧊 |

## Utilisation

### Navigation

- **Accueil** : Affichage temps réel des capteurs
- **Documentation** : Présentation du projet
- **Mon Compte** : Informations utilisateur
- **Déconnexion** : Fermeture de session

### Onglets

- **⏱️ Temps Réel** : Tableau avec valeurs actuelles, min/max
- **📊 Historique** : Graphique d'évolution des températures

### Alertes

- Affichées automatiquement en haut à droite
- Cliquer sur "📋 Alertes" pour voir l'historique complet
- Raccourci clavier : `Ctrl+A` (ou `Cmd+A` sur Mac)

### Mode Hors Ligne

- L'application continue de fonctionner sans connexion
- Les dernières données sont affichées depuis le cache
- Les données reçues en ligne sont automatiquement synchronisées

### Installation de l'App

- Cliquer sur "📥 Installer" pour installer la PWA
- Accès rapide depuis l'écran d'accueil
- Fonctionne comme une application native

## Accès

### Version Mobile

- Accédez via votre navigateur mobile
- Installez depuis le menu
- Fonctionne hors ligne

### Version Desktop

- Support complet du navigateur
- Responsive et adaptée aux petits écrans
- Installation possible sur certains navigateurs

## Technologies Utilisées

### Frontend

- **HTML5** : Sémantique, ARIA, Template
- **CSS3** : Flexbox, Grid, Media Queries, Variables CSS
- **JavaScript Vanilla** : ES6+, Promises, WebSocket
- **Web APIs** :
  - Shadow DOM
  - Custom Elements
  - Service Workers
  - IndexedDB
  - WebSocket
  - Notification API
  - Cache API

### Outils

- **Git** : Versioning et collaboration
- **HTTPS + SSL** : Certificats auto-signés pour dev
- **DevTools** : Debugging et profiling

## Difficultés Rencontrées et Solutions

### 1. **Gestion de la Connexion WebSocket**

**Problème** : Pertes de connexion et reconnexion instable

**Solution** :

- Implémentation d'un système de backoff exponentiel
- Reconnexion automatique jusqu'à 10 tentatives
- Gestion des erreurs avec messages informatifs

### 2. **Cache des Données Hors Ligne**

**Problème** : Impossible de mettre en cache les données WebSocket directement

**Solution** :

- Stockage dans IndexedDB lors de la réception
- Récupération au chargement de la page
- Affichage des données en cache en cas de déconnexion

## Améliorations Futures

1. **Backend** :
   - API REST pour persistance des données
   - Authentification utilisateur réelle
   - Stockage de l'historique long terme

2. **Frontend** :
   - Export CSV/PDF des données
   - Configuration personnalisée des seuils d'alerte
   - Thème sombre
   - Graphiques Chart.js avancés

3. **Fonctionnalités** :
   - Multi-capteurs (humidité, CO2, etc.)
   - Planification d'actions
   - Intégration domotique avancée

## Équipe

Projet réalisé par des étudiants de 2ème année de BUT Informatique

## License

Ce projet est fourni à titre éducatif.

---

**Dernier update** : 19 mars 2026
