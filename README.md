# Étude Math Pro (MathsProf SaaS 2.0)
### Plateforme Web Cloud & Mobile Multi-Appareils pour Enseignants de Mathématiques

Application Web moderne, responsive et complète conçue pour les professeurs de mathématiques indépendants, tuteurs et centres de formation. Accessible en ligne 24h/24 et 7j/7 depuis :
- 💻 **PC / Laptop (Windows, Mac, Linux)**
- 📱 **Smartphones (Android & iPhone)**
- 📱 **Tablettes (iPad, Samsung Galaxy Tab, etc.)**

Toutes les données sont **synchronisées instantanément et en temps réel** entre tous vos appareils grâce à une architecture Cloud avec base de données PostgreSQL ou SQLite locale flexible.

---

## 🎯 Points Forts de l'Architecture Multi-Appareils

1. **Synchronisation Temps Réel Multi-Device :**
   - Ajoutez un élève depuis votre téléphone ➔ Il apparaît instantanément sur votre PC.
   - Pointez une présence sur votre tablette ➔ Les statistiques se mettent à jour sur le tableau de bord PC.
   - Enregistrez un paiement sur PC ➔ Le reçu PDF et le statut sont immédiatement visibles sur mobile.
2. **Multi-Tenant (Comptes Enseignants Indépendants) :**
   - Chaque professeur peut créer son propre compte sécurisé (JWT 30 jours).
   - Cloisonnement et isolation stricte à 100% de toutes les données (élèves, groupes, séances, paiements, notes pédagogiques, projets de correction IA).
3. **Fonctionnement Double Hybride :**
   - **Mode Cloud Online :** Connecté à PostgreSQL (Render, Supabase, Neon, Railway, Docker, AWS).
   - **Mode Standalone Local :** Fonctionne clé en main sans configuration avec SQLite (`backend/data/math_prof.db`).
4. **PWA Mobile-Friendly :**
   - Responsive design sur mesure pour écrans tactiles mobiles (boutons ergonomiques, navigation inférieure rapide, barre de recherche universelle `Ctrl+K`).
   - Ajoutable en 1 clic sur l'écran d'accueil comme une application native mobile.

---

## 💼 Modules & Fonctionnalités Incluses

1. 📊 **Tableau de Bord & KPIs :** Effectif total, groupes actifs, séances du jour, taux d'assiduité, prévisions et recettes encaissées, alertes d'impayés.
2. 👥 **Gestion des Élèves (`/students`) :** Fiches détaillées, historique des présences et paiements, notes pédagogiques, liens WhatsApp directs pour contacter les parents.
3. 🏫 **Gestion des Groupes (`/groups`) :** Niveaux scolaires, jauges de capacité en temps réel, alertes de surcharge.
4. ⚖️ **Répartition Intelligente ("Smart Balancing" `/repartition`) :** Algorithme automatique d'équilibrage des groupes par niveau et capacité.
5. 📅 **Planning & Emploi du Temps (`/planning`) :** Calendrier hebdomadaire et mensuel avec détection automatique des conflits d'horaires et de salles.
6. ✅ **Pointage Rapide des Présences (`/attendance`) :** Présences, absences et retards en 1 clic ("Tout le monde présent").
7. 💳 **Paiements & Reçus Décharge PDF (`/payments`) :** Suivi mensuel, matrice d'encaissement et génération instantanée de reçus de paiement décharge PDF officiels.
8. 📄 **Rapports Mensuels & Quotidiens PDF (`/reports`) :** Bilans financiers et pédagogiques téléchargeables en PDF A4.
9. 🤖 **Correction IA & Rendu Manuscrit Ultra-Réaliste (`/corrections`) :**
   - Résolution pédagogique structurée en 5 étapes sans saut d'étape.
   - Vérification symbolique et numérique exacte via **SymPy**.
   - Moteur de rendu manuscrit sur fond de feuille Séyès (grands carreaux), petits carreaux (5mm) ou papier ligné.
   - Exportation PDF A4 haute définition prête à l'impression (300 DPI).
10. 📲 **Notifications WhatsApp & Planning du Soir (`/whatsapp`) :**
    - Envoi automatique ou manuel du programme du lendemain au professeur.
    - Support des passerelles UltraMsg, Webhooks ou mode Simulation.

---

## 🌐 Guide de Déploiement Cloud 100% En Ligne

### Option A : Déploiement Gratuit en 1 Clic sur Render

1. Créez un compte gratuit sur [Render.com](https://render.com).
2. Cliquez sur **New +** ➔ **Blueprint**.
3. Connectez votre dépôt GitHub / GitLab contenant ce projet.
4. Render détecte automatiquement le fichier `render.yaml` et déploie :
   - Un **Web Service FastAPI** avec le frontend intégré.
   - Une **Base de données PostgreSQL Cloud**.
5. Votre application est immédiatement en ligne avec une URL HTTPS sécurisée (ex: `https://etude-math-pro.onrender.com`).

---

### Option B : Déploiement avec Supabase (PostgreSQL Cloud) + Render / Railway

1. Créez un projet gratuit sur [Supabase.com](https://supabase.com).
2. Récupérez la chaîne de connexion PostgreSQL dans **Project Settings > Database > URI (Connection String)** :
   ```
   postgresql://postgres.xxxx:yourpassword@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
3. Si vous avez déjà des données locales dans votre SQLite que vous souhaitez conserver :
   ```bash
   python backend/migrate_to_postgres.py "postgresql://postgres.xxxx:yourpassword@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
   ```
4. Dans votre hébergeur web (Render, Railway, Fly.io, Koyeb, ou VPS), ajoutez la variable d'environnement :
   ```
   DATABASE_URL=postgresql://postgres.xxxx:yourpassword@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   SECRET_KEY=votre_cle_secrete_longue_et_aleatoire
   ```
5. Lancez avec :
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```

---

### Option C : Déploiement avec Docker & Docker Compose

Pour déployer sur un VPS (OVH, DigitalOcean, Hetzner, AWS EC2) avec Docker :

```bash
# 1. Cloner le projet
git clone <url_du_depot> math-prof-app
cd math-prof-app

# 2. Lancer les conteneurs (PostgreSQL + FastAPI + Frontend)
docker-compose up -d --build

# 3. Vérifier les logs
docker-compose logs -f
```

L'application est accessible sur `http://IP_DE_VOTRE_SERVEUR:8000`.

---

## 📱 Utilisation sur Smartphone (Android & iPhone) et Tablette

Une fois l'application déployée en ligne (ou accessible sur votre réseau WiFi local) :

### 🍏 Sur iPhone / iPad (Safari) :
1. Ouvrez Safari et accédez à l'URL de votre application (ex: `https://etude-math-pro.onrender.com`).
2. Appuyez sur le bouton **Partager** (icône carré avec flèche vers le haut en bas de l'écran).
3. Faites défiler vers le bas et sélectionnez **« Sur l'écran d'accueil »**.
4. Cliquez sur **Ajouter**.
5. L'icône **MathsProf** apparaît sur votre écran d'accueil et s'ouvre en plein écran comme une vraie application mobile !

### 🤖 Sur Android (Chrome) :
1. Ouvrez Google Chrome et accédez à l'URL de votre application.
2. Appuyez sur les **trois points verticaux** (Menu en haut à droite).
3. Sélectionnez **« Ajouter à l'écran d'accueil »** ou **« Installer l'application »**.
4. Validez l'installation.

---

## 💻 Exécution en Local sur PC (Mode Hors-Ligne / Développement)

### 1. Installation des dépendances
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

### 2. Démarrage du serveur
```powershell
python backend/run.py
```
Accédez à l'application locale sur **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

### 3. Accès depuis votre Téléphone sur le même WiFi local
Pour ouvrir l'application sur votre téléphone sans déploiement cloud :
1. Trouvez l'adresse IP locale de votre PC (`ipconfig` dans PowerShell, ex: `192.168.1.50`).
2. Sur votre téléphone connecté au même réseau WiFi, ouvrez le navigateur à l'adresse : `http://192.168.1.50:8000`.

---

## 🔑 Identifiants & Accès Enseignant

- **Compte Démonstration pré-configuré :**
  - **Email :** `admin@mathprof.tn`
  - **Mot de passe :** `password123`
  - *(Ou cliquez directement sur le bouton "Connexion en 1 Clic")*
- **Création d'un nouveau compte Enseignant :**
  - Cliquez sur l'onglet **« Créer un compte »** sur l'écran d'accueil.
  - Saisissez votre Nom, Email, Numéro WhatsApp et Mot de passe.
  - Un espace personnel 100% vierge et isolé vous sera alloué instantanément.

---

## 🧪 Tests Automatisés & Assurance Qualité

Exécutez la suite de tests complète (authentification JWT, multi-tenant isolation, solveur d'examens SymPy, PDF, API WhatsApp) :

```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests/ -v
```

---

## 🛡️ Sécurité & Sauvegardes

- Mots de passe hashés avec **Bcrypt**.
- Jetons **JWT sécurisés** avec expiration et vérification d'intégrité.
- Outil d'**Exportation / Importation JSON** complet accessible dans `Paramètres > Sauvegarde & Restauration`.
- Isolation absolue des requêtes au niveau de la base de données (`user_id`).
