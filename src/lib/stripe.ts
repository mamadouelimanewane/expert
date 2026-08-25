import Stripe from "stripe";

// Intégration Stripe pour l'onboarding digital : vérification d'identité
// (Stripe Identity) et mandat de prélèvement SEPA (Stripe Checkout, mode
// setup). Les deux flux sont entièrement hébergés par Stripe — aucune
// donnée d'identité ou bancaire ne transite ni n'est stockée par ce serveur.
// Config-gated comme le reste des intégrations tierces du cabinet (SMTP,
// taux de change) : sans clé, l'appelant doit gérer l'état "non configuré"
// plutôt que de simuler un flux.

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configurée");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}
