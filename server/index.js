require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = 3333;

const userId = "Shivam Chaudhary";

// This must be before any other middleware that touches the body
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the event
      switch (event.type) {
        case "payment_intent.created":
          const paymentIntentCreated = event.data.object;
          console.log("PaymentIntent created:", paymentIntentCreated.id);
          break;

        case "payment_intent.succeeded":
          const paymentIntentSucceeded = event.data.object;
          console.log("PaymentIntent succeeded:", paymentIntentSucceeded.id);
          break;

        case "payment_intent.requires_action":
          const paymentIntentAction = event.data.object;
          console.log("PaymentIntent requires action:", paymentIntentAction.id);
          break;

        case "charge.succeeded":
          const chargeSucceeded = event.data.object;
          console.log("Charge succeeded:", chargeSucceeded.id);
          break;

        case "checkout.session.completed":
          const session = event.data.object;
          console.log("session:", session);
          console.log("Checkout session completed:", session.id);
          console.log("Payment made by user:", session.metadata.userId);
          console.log("Payment amount:", session.amount_total / 100); // Convert from cents to dollars
          // Here you can fulfill the order, update database, send email etc.

          break;

        case "charge.updated":
          const chargeUpdated = event.data.object;
          console.log("Charge updated:", chargeUpdated.id);
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// Other middleware - must come after webhook route
app.use(express.json());
app.use(cors());

// Process payment endpoint
app.post("/process-payment", async (req, res) => {
  try {
    const { amount, productId } = req.body;

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Product ID: ${productId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173?success=true",
      cancel_url: "http://localhost:5173?canceled=true",
      metadata: {
        userId: userId,
        productId: productId.toString(),
      },
    });

    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
