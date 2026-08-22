# 🔐 Accès à l'application

> Ce fichier ne contient **aucun identifiant**. Les mots de passe ne sont jamais
> versionnés, jamais écrits dans la documentation, jamais transmis par email.

## Où sont les identifiants ?

Dans le gestionnaire de mots de passe du cabinet. Si vous n'y avez pas accès,
demandez-le à l'administrateur — ne demandez jamais un mot de passe en clair
sur une messagerie.

## Environnements

| Environnement | URL |
|---|---|
| Production | https://expert-pi.vercel.app |
| Portail client | https://expert-pi.vercel.app/portal?…  *(lien nominatif généré par le cabinet)* |
| Local | http://localhost:3000 |

## Rôles

| Rôle | Portée |
|---|---|
| `ADMIN` | Accès complet, y compris `/api/admin/*` et la rotation des mots de passe |
| `EXPERT` | Missions, clients, audits, états financiers |
| `COLLABORATOR` | Production comptable, saisie, temps |
| `ASSISTANT` | Consultation et tâches assignées |

## Créer le premier compte administrateur

Aucun mot de passe par défaut n'existe. Le script en génère un et l'affiche
une seule fois :

```bash
npm run seed:admin
```

Pour imposer une valeur choisie (obligatoire en production) :

```bash
ADMIN_PASSWORD='<secret fort, 16+ caractères>' npm run seed:admin:prod
```

## En cas de fuite d'identifiants

Rotation immédiate de tous les comptes staff :

```bash
npx tsx scripts/rotate-passwords.ts
```

Ou, si l'application est en ligne et que vous disposez d'une session `ADMIN`,
l'endpoint `POST /api/admin/reset-passwords` avec `{ "emails": [...] }` fait la
même chose et renvoie les nouveaux secrets une seule fois.

## Portail client

Chaque client dispose d'un `portalToken` opaque de 32 octets généré à sa
création. Il est transmis via l'en-tête `x-portal-token`. Ce token vaut
authentification : il ne doit apparaître ni dans une URL partagée, ni dans un
ticket de support. Pour le révoquer, désactivez `portalEnabled` sur la fiche
client, ou régénérez le token.
