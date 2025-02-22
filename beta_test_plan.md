# Haddock - Beta Test Plan

Epitech Lyon

Mathias ANDRÉ - Alexandru GHERASIE - Maxime DZIURA - Léo Dubosclard - Arthur DELBARRE - Thomas MAZAUD

&nbsp;

# Sommaire

1. [Context](#context)

    1. [D’où vient l’idée de ce projet ?](#doù-vient-lidée-de-ce-projet)

    2. [Quelle est l’ambition du projet ?](#quelle-est-lambition-du-projet)

2. [Spécifications Techniques](#spécifications-techniques)

    1. [Concepts](#concepts)

    2. [Installateur](#installateur)

    3. [Interface Utilisateur](#interface-utilisateur)

        1. [Services d’authentification](#services-dauthentification)

        2. [Premier lancement](#premier-lancement)

        3. [Connexion et Inscription](#connexion-et-inscription)

        4. [Tableau de bord](#tableau-de-bord)

        5. [Page Projet](#page-projet)

            1. [Topologie](#topologie)

            2. [Monitoring](#monitoring)

            3. [Logs](#logs)

            4. [Paramètres](#paramètres)

    4. [Stack technique et architecture](#stack-technique-et-architecture)

    1. [Frontend](#frontend)
    2. [Backend](#backend)
    3. [Monorepo](#monorepo)

5. [Beta Test Scénarios](#beta-test-scénarios)

    1. [Test Installateur](#test-installateur)

    2. [Test Interface Utilisateur](#test-interface-utilisateur)

        1. [Test Services d’authentification](#test-services-dauthentification)

        2. [Test Premier lancement](#test-premier-lancement)

        3. [Test Connexion et Inscription](#test-connexion-et-inscription)

        4. [Test Tableau de bord](#test-tableau-de-bord)

        5. [Test Page Projet](#test-page-projet)

            1. [Test Topologie](#test-topologie)

            2. [Test Monitoring](#test-monitoring)

            3. [Test Logs](#test-logs)

            4. [Test Paramètres](#test-paramètres)


# Context

## D’où vient l’idée de ce projet ?

Plus de 79 000 entreprises utilisent les conteneurs informatiques dans le cadre de leur processus de développement. L’orchestration avec docker-compose répond aux besoins dans la majorité des cas pour le test d’applications en pré production, le prototypage et la production des petites et moyennes applications.

Cependant, aucune plateforme accompagne, de façon complète, avec une expérience clé en main, les professionnels et particuliers dans le déploiement de leurs applications conteneurisées.

__Kubernetes__ est un outil devops très complet mais nécessite des compétences pointilleuses pour la mise en place et le déploiement de nouveaux outils.

__Portainer__ utilise le principe de Stack qui ne gère pas le réseau aussi efficacement que docker-compose et demande des configurations supplémentaires.

Une problématique sous-jacente à ces solutions également en place est la gestion de multi-applications. En effet, déployer deux projets sur la même machine crée généralement des conflits sur l'environnement, les ports, les processus système…

Sur __Haddock__ chaque projet tourne dans une machine virtuelle sécurisée et exécutée au niveau du kernel de la machine pour assurer des performances sans altération.

## Quelle est l’ambition du projet ?

Haddock aimerait être entièrement open-source et 100% self-hostable.

L’outil a pour objectif d’assumer, de manière clé en main, les notions de déploiement automatique, de virtualisation et d’administration de parc de machines virtuelles, de configuration réseau et de mise à disposition des projets sur le web (incluant le SSL et le routing DNS).

# Spécifications Techniques

## Concepts

__Projet__

Un projet dans le cadre du PaaS Haddock est défini comme une instance unique qui inclut plusieurs éléments essentiels.

- __La source du projet__ est déterminée par:
    - un dépôt GIT

- __Des configurations complémentaires__ selon la source du projet:
    - GIT: Position absolue du fichier compose
    - GIT: URL du dépôt, branche distante, surveillance des commits ou non
- La configuration de la machine virtuelle sur laquelle le projet sera exécuté, incluant des paramètres la RAM et les VCPU


__Service__

Un service, au sein d'un projet Haddock, est une unité fonctionnelle détectée par la configuration définie dans le fichier Compose. Chaque service représente une partie distincte de l'application déployée, telle qu'une base de données, un serveur web, ou tout autre composant micro-service. Haddock permet de gérer ces services en offrant la possibilité de rediriger des domaines spécifiques vers eux et de consulter leurs configurations via l'interface utilisateur.

## Installateur

Le projet doit être conçu de manière à ce que son installation puisse être effectuée en une seule commande sur tout appareil fonctionnant sous Linux ou Windows Server. Pour faciliter cette installation, un script d'installation interactif, similaire à celui de NestJS, doit être fourni à l'utilisateur.

Le script d'installation, doit être capable d'identifier l'environnement de l'hôte et son système d'exploitation. Cela permettra d'utiliser le gestionnaire de paquets le plus adapté pour l'installation des dépendances et d'effectuer les configurations nécessaires aux endroits appropriés.

Le script d'installation doit également permettre à l'utilisateur de configurer certaines valeurs par défaut nécessaires à l'installation de Haddock. Ces valeurs peuvent être définies via des questions interactives posées à l'utilisateur. Par exemple, l'utilisateur peut être invité à indiquer l'addresse ip utilisée par Haddock.

Enfin, si l'installation est réussie, une URL temporaire doit être affichée à l'utilisateur. Cette URL permet à l'utilisateur d'effectuer la première configuration de l'application

## Interface Utilisateur

L'interface utilisateur de Haddock se présente sous la forme d’une application web développée avec React et shadcn/ui (Radix UI + Tailwind).

### Services d’authentification

L’authentification au sein de l’application sera possible via les moyens suivants (dénommés ci-après services d’authentification):
- Email:
    - Inscription: Email + Mot de passe (avec répétition)
    - Connexion: Email + Mot de passe
- GitHub: Inscription et connexion via oauth GitHub

### Premier lancement

Au premier lancement de l’application après son installation, aucune fonctionnalité ne doit être disponible. L’application web n'affiche qu’un formulaire de configuration de la solution :

Un champ de texte invite l’utilisateur à mentionner un domaine principal qu’il souhaite utiliser pour son panel web.

Les noms de domaines acceptés incluront les domaines et sous-domaines.

Une fois le domaine saisi, l’utilisateur cliquera sur un bouton de confirmation, lui affichant le protocole à suivre pour lier un domaine primaire.

Voici un exemple de protocole pour le domaine example.com :

    1. Lier le domaine primaire

L’utilisateur doit lier le domaine example.com à l’adresse IPV4 de son serveur hôte.

On lui propose directement la basile au format BIND pour la configuration de son domaine, soit:

`example.com. IN A 12.34.56.78`

    2. Lier le domaine wildcard

L’utilisateur doit lier le domaine wildcard *.example.com à l’adresse IPV4 de son serveur
hôte.

On lui propose directement la balise au format BIND pour la configuration de son domaine, soit:

`* IN A 12.34.56.78`

    3. Challenge de vérification

L’utilisateur doit passer un challenge de vérification attestant de sa possession du nom de domaine. Un code aléatoire est généré et doit être renseigné sous forme d’une balise TXT du nom de domaine.

On lui propose directement la balise au format BIND pour la configuration de son domaine, soit:

`IN TXT _haddock_challenge=TTn9CSMxHHSTDEsp`

Un bouton de rafraîchissement permet de vérifier le bon avancement des étapes sous forme de check ou d’horloge s’affichant avec le titre de la section de l’étape.

Si toutes les étapes sont validées, un bouton de sauvegarde s’active, enregistrant le nom de domaine et fermant la liste des étapes.

Le nom de domaine est ajouté à une liste et est identifié par un icône de couronne indiquant qu’il s’agit du nom de domaine principal de l’application. L’utilisateur est alors redirigé vers ce nom de domaine (qui remplace désormais l’URL temporaire) pour la suite de la configuration.

### Connexion et Inscription

<ins>Inscription</ins>:

Si un utilisateur navigue vers l’application après la première configuration, ils ne peuvent afficher qu’un formulaire d’inscription (/_signup_) et un formulaire de connexion (/_signin_).

<ins>Connexion</ins>:

La page de connexion permet aux utilisateurs inscrits de se connecter via les __services d’authentification__.

<ins>Mot de passe oublié</ins>:

Les utilisateurs ayant procédé à une inscription par email et mot de passe pourront utiliser une fonctionnalité de récupération de mot de passe oublié présente sur le formulaire d'inscription.

Le bouton redirige vers un formulaire invitant l’utilisateur à renseigner son adresse email. Si l’utilisateur avait précédemment renseigné une adresse email valide dans le formulaire de connexion, ce champ sera rempli par défaut.

À la soumission du formulaire, l'existence de l’utilisateur et la présence d’un mot de passe associé à son compte est vérifié. Un email est envoyé avec un lien unique de réinitialisation de mot de passe de durée de validité d’une heure.

Le lien de réinitialisation redirige vers une page invitant l’utilisateur à renseigner un nouveau mot de passe avec un champ de confirmation.

### Tableau de bord

    A. List des projets

Le tableau de bord présente une vue d'ensemble de tous les projets de l'utilisateur. Chaque projet est représenté de manière succincte.

Chaque carte de projet présente:
- Son nom
- La description du projet (si définie, tronquée si trop longue)
- La source de déploiement
- La date du dernier déploiement
- L’état du projet (On/Off/Starting)

Il sera possible de trier les projets par date de création, date du dernier déploiement, statut, nom. Chaque filtre sera déclinable en croissant et décroissant.

Un utilisateur possédant les permissions nécessaires peut ajouter un nouveau projet en cliquant sur un bouton dédié sur le tableau de bord, qui ouvre un formulaire de configuration.

    B. Création d’un projet

La création d’un projet se fait via une boîte de dialogue de configuration du projet.

Lors de la configuration d'un nouveau projet, l'utilisateur doit renseigner les informations nécessaires selon la section [Concepts > Projet](#concepts).

La boîte de dialogue proposera plusieurs pages, pour chaque étape de la configuration, avec possibilité de revenir à la page précédente.

Une fois le projet créé, la carte de projet vient s’ajouter à la suite des autres

### Page Projet

Ouvrir un projet affiche une page présentée comme il suit:

Un header précédera le contenu principal de la page, il affichera:
- L’icône Haddock, en haut à gauche, permettant de revenir au dashboard
- Le nom du projet, en haut à gauche
- Les différents onglets de la page: Topologie, Monitoring, Logs, Paramètres (l'onglet Topologie est sélectionné par défaut)

Le contenu principal variera en fonction de l’onglet sélectionné:

#### Topologie

Une vue topologique des services, présentant leurs interactions réseau et leurs dépendances de lancement. L’affichage se fera sous forme de graphe via la librairie __React Flow__.

Cette vue affichera les services sous forme de noeuds, affichant les informations suivantes:
- Icône de l’image
- Nom du service
- Nom de l’image
- État de santé du service

Il sera possible de se déplacer dans la vue topologique au drag de la souris et de zoomer la vue à la molette. Un raccourci de zoom sera également affiché en bas à droite.

En cliquant sur un service, l'utilisateur peut consulter sa configuration détaillée, via une boîte de dialogue qui vient s’ouvrir sur la partie droite de l’écran, sans bloquer la navigation dans la vue topologique. Cette boîte de dialogue comportera les onglets suivants :

<ins>Statut</ins>

- État du conteneur :
    - Actif
    - Éteint
    - En démarrage
- Temps écoulé dans la session actuelle du conteneur
- Image utilisée par le conteneur
- Histogramme de l’uptime
- Boutons d’actions pour redémarrer, démarrer et arrêter le service

<ins>Configuration</ins>

Vue d’ensemble des configurations détectées dans le fichier compose :

- Variables d'environnement
- depends-on
- CPUs
- Mémoire (mem)
- Utilisateur (user)

Pour plus de détails, consultez la documentation Docker : https://docs.docker.com/compose/compose-file/05-services/.

<ins>Réseau</ins>

Vue d’ensemble de la configuration réseau :

- Réseaux internes
- Port Forwarding : Configuration des redirections
- Liste déroulante permettant de sélectionner un des port forwarding mentionné dans
le fichier compose
- Attribution d’un domaine parmi les noms de domaines configurés par l’utilisateur
- Sous-domaine obligatoire, pouvant être composé de plusieurs particules

<ins>Logs</ins>

Affichage en temps réel des logs émis par le conteneur

<ins>Shell</ins>

Si le conteneur le permet, accès à un shell attaché à ce dernier via une librairie type react-terminal


#### Monitoring

La page de monitoring se présente sous forme d’un dashboard présentant différents histogrammes:

- L’utilisation RAM de l’ensemble du projet
- L’utilisation CPU de l’ensemble du projet
- L’uptime des services
- L’utilisation du disque

#### Logs

La page des logs permet de consulter la totalité des logs du projet. Un code couleur permettra de différencier les différents services.

Une barre de recherche permettra de filtrer les logs selon les critères suivants:

- Une recherche fulltext avec la possibilité d’utiliser des wildcards
- Un intervalle de temps
- Le service ayant émis les logs

Il sera possible d’exporter sous forme de fichier texte.

#### Paramètres

Les paramètres du projet seront découpés en plusieurs onglets, navigables via un menu latéral à gauche.

<ins>Général</ins>

- __Informations du projet__
    - Titre
    - Description du projet (optionnelle)
- __Propriétaire du projet__ : Cette section affiche l’utilisateur ayant initié le projet et permet de changer son propriétaire
- __Suppression du projet__ : Cette fonctionnalité demandera une vérification pour éviter une suppression involontaire

<ins>Infrastructure</ins>

- __Configuration de la machine virtuelle__
    - Configuration de la RAM à disposition
    - Configuration des CPUs à disposition

<ins>Variables</ins>

Liste des variables d’environnement avec possibilité de créer des variables.

La liste des variables est précédée par des champs “Clé” et “Valeur”, si les deux sont renseignés, un bouton “Ajouter” s’active permettant l’ajout de la variable.

Une variable d'environnement peut être soit publique soit secrète :

La valeur d’une variable d'environnement publique est affichée en clair.

La valeur d’une variable d’environnement secrète est remplacée par des passwords bullets, elle ne peut être consultée d’aucune manière. Elle peut cependant être remplacée

<ins>Membres</ins>

Permet de configurer les membres ayant accès au projet.

Une liste déroulante avec fonctionnalité de recherche permet de sélectionner un utilisateur parmi les inscrits à l’application. Il est possible de choisir d’ajouter l’utilisateur en lecture seule ou avec les droits de modifications.

<ins>Déploiement</ins>

    Source

Permet de configurer la source de déploiement. Les paramètres complémentaires dépendent des sources décrites dans la section Projet du document.

Un boîte de dialogue avertit l’utilisateur lors de la sauvegarde concernant l'irréversibilité de l’action.

    Démarrage

Il est possible de renseigner une commande ou le chemin vers un exécutable qui sera lancé au démarrage de l’instance du projet.

<ins>Volumes</ins>

Cette page affiche la liste des volumes déclarés dans le projet.

<ins>Sauvegardes</ins>

Un icône permet d’ouvrir une boîte de dialogue concernant les sauvegardes automatiques du volume.

Le haut de la boîte de dialogue contient un menu déroulant permettant de choisir la fréquence de sauvegarde parmi:
- Aucune
- Journalier
- Hebdomadaire
- Mensuel

Un champ de saisie permet de sélectionner le nombre de sauvegardes conservées pour le projet, ou de choisir “illimité” à l’aide d’une case à cocher.

Un bouton permet de réaliser une sauvegarde instantanée.

Les sauvegardes réalisées sont affichées sous forme de liste, affichant:
- La date de la sauvegarde
- Le poids de la sauvegarde
- Un bouton d’action sous forme de vertical ellipsis
    - Restaurer la sauvegarde
    - Verrouiller/Déverrouiller la sauvegarde
    - Supprimer la sauvegarde

Une sauvegarde verrouillée affiche un cadenas devant la date et n’est plus prise en compte dans le calcul de la suppression automatique.

## Stack technique et architecture

### Frontend

Le développement du frontend de l'application sera réalisé à l'aide de React.JS en TypeScript. L’application s’appuiera sur shadcn/ui pour la conception des composants.

L'application sera conçue avec une attention particulière au responsive mobile, cependant toutes les fonctionnalités ne seront pas nécessairement disponibles sur certains appareils de par notre volonté d’adopter une approche desktop first. L’application sera optimisée pour la majorité des navigateurs modernes.

L’application sera conçue en correspondance avec les recommandations du WCAG et des normes ARIA quant à l’accessibilité des personnes en situation de handicap.

Le code sera structuré en suivant les principes du design atomique, ce qui facilitera la gestion et la scalabilité du projet. Chaque composant, qu'il soit un atome, une molécule ou un organisme, sera développé de manière isolée avant d'être intégré dans des structures plus complexes. Cette approche maximisera la réutilisation des composants à travers toute l'application.

### Backend

Le backend de l'application sera développé en utilisant NestJS avec TypeScript, permettant une architecture modulaire de l’application. L’application sera conçue en respectant une layered architecture contrôleur -> applicative -> domaine -> repository.

Pour gérer les tâches asynchrones, nous intégrerons Bull, une bibliothèque de gestion de queues basée sur Redis. Bull permettra de traiter les tâches lourdes et les travaux en arrière-plan de manière efficace et fiable.

L’architecture sera conçue pour implémenter différents providers de machines virtuelles. Vagrant sera implémenté par défaut et fonctionnera avec libvirt/KVM pour les serveurs Linux et VirtualBox pour les Windows Server.

### Monorepo

Le projet sera structuré selon les recommandations de __yarn workspaces__ pour la limitation de la redondance du code.

Cette structure tire profit de l’utilisation du Typescript dans les différentes parties du projet pour proposer une librairie de code partagée comme les types des retour et de requête des APIs.

Les __Yarn workspaces__ permettent également de gérer les différentes parties du projet de manière centralisée à l’aide de l’architecture monorepo

# Beta Test Scénarios

## Format des tests

Caque test est défini par dans un fichier markdown qui suit le format suivant :

```md
# Nom du Test

## Environnement de test

......

## Rôle de l'utilisateur

......

## Fonctionnalité testée

......

## Étape(s) du test

......

## Résultat(s) attendu(s)

......

## Résultat(s) obtenu(s)

......
```

Fichier de template : [template.md](./beta_test_plan/template.md)


## Test Installateur

Test sur le script d'installation : [test_installateur.md](./beta_test_plan/installateur/test_installateur.md)

## Test Interface Utilisateur

### Test Services d’authentification

### Test Premier lancement

### Test Connexion et Inscription

### Test Tableau de bord

### Test Page Projet

#### Test Topologie

#### Test Monitoring

#### Test Logs

#### Test Paramètres