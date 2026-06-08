# Session vs JWT — Authentification

## Session (côté serveur)

Le serveur crée une entrée en base à la connexion et envoie un identifiant opaque (`session_id`) dans un cookie. À chaque requête, le serveur retrouve la session via cet identifiant.

```
Login
  → créer session en BDD { userId, role, expiresAt }
  → cookie: session_id=abc123

Requête suivante
  → lire session_id du cookie
  → SELECT * FROM sessions WHERE id = 'abc123'   ← 1 aller-retour BDD
  → retourner les données de session
```

### Pour
- Révocation instantanée : supprimer la ligne en BDD = session morte immédiatement
- Données toujours fraîches : rôle changé en BDD → effectif à la prochaine requête
- Simple à implémenter et à raisonner
- Pas de logique de refresh token

### Contre
- 1 aller-retour BDD par requête (acceptable sur infra classique, ~1–10ms)
- Ne passe pas à l'échelle horizontale sans session partagée (Redis, DB centralisée)
- Dépendance à la disponibilité de la BDD pour chaque requête

---

## JWT (JSON Web Token)

Le serveur génère un token signé contenant les données directement. La vérification est locale (cryptographie), sans toucher la BDD.

```
Login
  → signer JWT { userId, role, exp: +15min }
  → cookie: access_token=eyJ...  +  refresh_token=xyz (en BDD)

Requête suivante
  → lire access_token
  → vérifier signature localement                 ← 0 BDD
  → retourner le payload

Access expiré
  → lire refresh_token
  → SELECT * FROM refresh_tokens WHERE hash = ?   ← 1 BDD
  → révoquer l'ancien, créer le nouveau
  → générer un nouvel access JWT
  → continuer la requête
```

### Pour
- 0 BDD sur les requêtes normales (access token valide)
- Scalabilité horizontale native : n'importe quel serveur vérifie le token sans état partagé
- Idéal pour microservices ou API distribuées

### Contre
- Révocation impossible avant expiration sans blocklist (BDD ou Redis)
- Données potentiellement obsolètes : rôle changé en BDD mais le JWT actif porte l'ancien rôle jusqu'à expiration
- Implémentation plus complexe (rotation de refresh token, gestion de l'expiration, etc.)
- Surface d'attaque plus grande si mal configuré (algorithme `none`, secret faible…)

---

## Comparaison directe

| Critère                   | Session          | JWT                        |
|---------------------------|------------------|----------------------------|
| BDD par requête           | 1                | 0 (access valide)          |
| Révocation immédiate      | Oui              | Non (sans blocklist)       |
| Données toujours fraîches | Oui              | Non (jusqu'à expiration)   |
| Scale horizontal          | Nécessite Redis  | Natif                      |
| Complexité                | Faible           | Moyenne à élevée           |
| Adapté à                  | Monolithe, SaaS  | Microservices, API publique |

---

## Choix retenu : Session

Pour ce projet, la session en BDD est le bon choix :

- Accès unique et contrôlé, pas de scale horizontal nécessaire
- La latence d'un SELECT sur la table sessions est négligeable (~1–5ms sur réseau local)
- Révocation immédiate sans complexité supplémentaire
- Moins de surface d'attaque, moins de code à maintenir

Le JWT n'apporte de la valeur qu'à partir du moment où la latence BDD devient un goulot d'étranglement réel, ou quand l'architecture devient distribuée. Ce n'est pas le cas ici.
