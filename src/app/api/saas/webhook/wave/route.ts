import { NextResponse } from "next/server";

/**
 * SaaS subscription activation is paused together with public checkout.
 * The previous handler inferred subscription duration from the payment
 * amount and had no event-level idempotency key; replayed notifications could
 * repeatedly extend a cabinet. Do not mutate subscriptions until checkout
 * records expected amount/cycle and webhook events are deduplicated.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "L'activation automatique des abonnements est suspendue jusqu'à la mise en place de contrôles de montant et d'idempotence.",
    },
    { status: 503 }
  );
}
