---
description: Onboarding d'un nouveau client (KYC, Engagement & Setup)
---

Ce workflow guide le collaborateur dans la création d'un nouveau dossier client conforme aux normes OHADA.

1. **Création du Dossier CRM**
   - Accéder à `/clients` et cliquer sur "Nouveau Client".
   - Remplir les informations d'identification (RCCM, NIF/IFU, NINEA selon le pays).
   - Vérifier le statut KYC (Know Your Customer) via le module `/compliance`.

2. **Génération de la Lettre de Mission**
   - Accéder à `/lettres-mission`.
   - Utiliser le générateur pour créer une convention adaptée (Audit, Tenue ou Social).
   - Définir le budget et les honoraires (TVA 18% OHADA).

3. **Signature Électronique**
   // turbo
   - Envoyer le document à signer via `/api/signature/process`.
   - Vérifier l'apparition du sceau probant dans le "Coffre-fort numérique".

4. **Initialisation de la Production**
   - Créer la première mission récurrente dans `/missions`.
   - Configurer les accès au portail client `/portal`.
