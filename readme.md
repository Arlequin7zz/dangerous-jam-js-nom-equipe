# The Toxic Floor

**The Toxic Floor** est un jeu de survie frénétique en 2D où votre seul objectif est de rester en vie le plus longtemps possible. Évitez les vagues d'ennemis, esquivez leurs projectiles et, surtout, ne touchez pas le sol quand il devient toxique !

<img src="./assets/Capture d’écran 2026-03-26 à 09.21.27.png" alt="Aperçu du jeu" width="800">

## 📜 Gameplay

Le concept est simple, mais la survie est un défi. Le sol de l'arène change constamment de couleur, indiquant son état :

-   🟩 **VERT** : Le sol est sûr. Vous pouvez le toucher sans crainte.
-   🟧 **ORANGE** : C'est un avertissement ! Le sol va bientôt devenir mortel. Préparez-vous à sauter ou à vous positionner en hauteur.
-   🟥 **ROUGE** : Danger de mort instantanée ! Toucher le sol vous infligera des dégâts continus.

Des ennemis de plus en plus nombreux et variés apparaîtront pour vous compliquer la tâche. Heureusement, des power-ups pourront vous aider dans votre lutte pour la survie.

## 🕹️ Contrôles

| Touche | Action |
| :--- | :--- |
| `ZQSD` ou `Flèches` | Se déplacer |
| `SHIFT` | Dash (Esquive rapide) |
| `V` | Activer / Couper le son |
| `ESPACE` / `ENTRÉE` | Démarrer le jeu / Continuer |
| `H` (menu) | Afficher les instructions |
| `C` (menu) | Choisir le personnage et le mode |

## ✨ Fonctionnalités

-   **Leaderboard Local** : Votre meilleur score est sauvegardé sur votre navigateur. Tentez de battre votre propre record !
-   **Personnages Uniques** : Choisissez entre 3 personnages avec des vitesses différentes pour varier votre style de jeu.
-   **Deux Modes de Jeu** :
    -   **Classic** : L'expérience de base, avec des phases d'avertissement.
    -   **Hardcore** : Pour les joueurs aguerris. Le sol passe directement de sûr à toxique sans avertissement !
-   **Difficulté Progressive** : Le jeu devient de plus en plus rapide et difficile à mesure que votre temps de survie augmente.
-   **Effets Visuels Dynamiques** : Le contour de l'arène pulse au rythme de la musique pour une immersion accrue.
-   **Événements Chaotiques** : Des corruptions du système peuvent survenir à tout moment, inversant les couleurs de l'écran pour un défi supplémentaire.
-   **Système de Vagues** : Survivez aux vagues successives d'ennemis.

## 👾 Personnages

Choisissez votre survivant depuis le menu `Character & Mode` (`C`).

1.  **👻 Fantôme** : Vitesse normale (8). L'expérience équilibrée.
2.  **🤖 Robot** : Lent (6). Un plus grand défi pour les experts de l'esquive.
3.  **👽 Alien** : Rapide (10). Idéal pour se sortir rapidement des situations périlleuses.

## 🚀 Comment lancer le projet

Ce projet est conçu pour être exécuté directement dans un navigateur web.

1.  Assurez-vous d'avoir tous les fichiers du projet dans le même dossier :
    -   `index.html` (ou le fichier HTML principal)
    -   `src/script.js`
    -   `src/player.js` (et autres classes JS)
    -   `assets/Instru by dasss.m4a` (et autres ressources)

2.  Ouvrez le fichier `index.html` avec votre navigateur web préféré (Chrome, Firefox, etc.).

    > **Note**
    > Pour une meilleure performance et pour éviter des problèmes de sécurité liés à CORS (si vous chargez des fichiers externes), il est recommandé de lancer le jeu via un serveur local. Des outils comme Live Server pour VS Code le font en un clic.

## 🛠️ Développé avec

-   **Moteur** : JavaScript pur (Vanilla JS)
-   **Rendu** : HTML5 Canvas
-   **Stockage** : Web Storage API (`localStorage`) pour les scores.

## 🙏 Crédits

-   **Musique** : `Instru by dasss.m4a`. Un grand merci pour la bande-son entraînante !

---

*Ce projet a été développé dans le cadre d'une Game Jam.*