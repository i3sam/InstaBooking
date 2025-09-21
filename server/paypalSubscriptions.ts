import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";
import { storage } from "./storage";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID) {
  throw new Error("Missing PAYPAL_CLIENT_ID");
}
if (!PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PAYPAL_CLIENT_SECRET");
}

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Production, // Using live credentials
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
      logBody: true,
    },
  },
});

const oAuthController = new OAuthAuthorizationController(client);

// Store plan information
const SUBSCRIPTION_PLANS = {
  pro: {
    name: "Pro Membership",
    amount: "29.99",
    currency: "USD",
    description: "Monthly Pro membership with all features"
  }
};

let productId: string | null = null;
let planIds: { [key: string]: string } = {};

// Ensure product exists for our subscriptions
async function ensureProduct(): Promise<string> {
  if (productId) {
    return productId;
  }

  try {
    console.log("Creating PayPal product for subscriptions...");
    
    const productData = {
      body: {
        name: "Pro Membership Subscription",
        description: "Monthly subscription for pro features",
        type: "SERVICE",
        category: "SOFTWARE",
        image_url: "https://example.com/product-image.jpg",
        home_url: "https://yourapp.com"
      }
    };

    const response = await fetch("https://api-m.paypal.com/v1/catalogs/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAccessToken()}`,
        "Accept": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(productData.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal product creation failed:", response.status, errorText);
      throw new Error("Product creation failed");
    }

    const product = await response.json();
    productId = product.id;
    
    console.log("✅ PayPal product created:", productId);
    return productId as string;
  } catch (error) {
    console.error("Failed to create PayPal product:", error);
    throw new Error("PayPal product creation failed");
  }
}

// Ensure billing plan exists for a subscription type
async function ensurePlan(planKey: string): Promise<string> {
  if (planIds[planKey]) {
    return planIds[planKey];
  }

  const productId = await ensureProduct();
  const planInfo = SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];
  
  if (!planInfo) {
    throw new Error(`Unknown plan: ${planKey}`);
  }

  try {
    console.log(`Creating PayPal billing plan for ${planKey}...`);
    
    const planData = {
      product_id: productId,
      name: planInfo.name,
      description: planInfo.description,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: planInfo.amount,
              currency_code: planInfo.currency
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: planInfo.currency
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "0",
        inclusive: false
      }
    };

    console.log("Sending plan data:", JSON.stringify(planData, null, 2));
    
    const response = await fetch("https://api-m.paypal.com/v1/billing/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAccessToken()}`,
        "Accept": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(planData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal plan creation failed:", response.status, errorText);
      console.error("Request body was:", JSON.stringify(planData, null, 2));
      throw new Error("Plan creation failed");
    }

    const plan = await response.json();
    planIds[planKey] = plan.id;
    
    console.log(`✅ PayPal billing plan created for ${planKey}:`, plan.id);
    return plan.id;
  } catch (error) {
    console.error(`Failed to create PayPal plan for ${planKey}:`, error);
    throw new Error("PayPal plan creation failed");
  }
}

// Get access token for direct API calls
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    
    const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    throw new Error("PayPal authentication failed");
  }
}

// Create a subscription
export async function createSubscription(req: Request, res: Response) {
  try {
    const { planKey, userId } = req.body;
    
    if (!planKey || !SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS]) {
      return res.status(400).json({ error: "Invalid or missing plan" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const planId = await ensurePlan(planKey);
    const planInfo = SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS];
    
    console.log(`Creating subscription for user ${userId} with plan ${planKey} (${planId})`);

    const subscriptionData = {
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      application_context: {
        brand_name: "Your App",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: `${req.protocol}://${req.get('host')}/subscription/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/subscription/cancel`
      }
    };

    const response = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAccessToken()}`,
        "Accept": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(subscriptionData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal subscription creation failed:", response.status, errorText);
      throw new Error("Subscription creation failed");
    }

    const subscription = await response.json();
    
    // Store subscription in database
    await storage.createSubscription({
      id: subscription.id,
      userId: userId,
      planId: planId,
      planName: planKey,
      status: "APPROVAL_PENDING",
      currency: planInfo.currency,
      amount: planInfo.amount
    });

    // Find approval URL
    const approvalUrl = subscription.links?.find((link: any) => link.rel === "approve")?.href;
    
    if (!approvalUrl) {
      throw new Error("No approval URL returned from PayPal");
    }

    console.log("✅ Subscription created:", subscription.id);
    
    res.json({
      subscriptionId: subscription.id,
      approvalUrl: approvalUrl,
      status: subscription.status
    });
  } catch (error) {
    console.error("Failed to create subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
}

// Get subscription details
export async function getSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;
    
    const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAccessToken()}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal get subscription failed:", response.status, errorText);
      throw new Error("Get subscription failed");
    }

    const subscription = await response.json();
    
    // Update local database with current status
    await storage.updateSubscription(subscriptionId, {
      status: subscription.status,
      startTime: subscription.start_time ? new Date(subscription.start_time) : null,
      nextBillingTime: subscription.billing_info?.next_billing_time ? new Date(subscription.billing_info.next_billing_time) : null
    });

    res.json(subscription);
  } catch (error) {
    console.error("Failed to get subscription:", error);
    res.status(500).json({ error: "Failed to get subscription" });
  }
}

// Cancel subscription
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${await getAccessToken()}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        reason: reason || "User requested cancellation"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal cancel subscription failed:", response.status, errorText);
      throw new Error("Cancel subscription failed");
    }

    // Update local database
    await storage.updateSubscription(subscriptionId, {
      status: "CANCELLED"
    });

    console.log("✅ Subscription cancelled:", subscriptionId);
    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
}

// Webhook handler for subscription events
export async function handleWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    console.log("PayPal webhook received:", event.event_type);

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await storage.updateSubscription(event.resource.id, {
          status: "ACTIVE",
          startTime: new Date(event.resource.start_time),
          nextBillingTime: event.resource.billing_info?.next_billing_time ? new Date(event.resource.billing_info.next_billing_time) : null
        });
        console.log("✅ Subscription activated:", event.resource.id);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await storage.updateSubscription(event.resource.id, {
          status: "CANCELLED"
        });
        console.log("✅ Subscription cancelled:", event.resource.id);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await storage.updateSubscription(event.resource.id, {
          status: "SUSPENDED"
        });
        console.log("⚠️ Subscription suspended:", event.resource.id);
        break;

      case "PAYMENT.SALE.COMPLETED":
        // Payment successful - update next billing time if available
        const subscriptionId = event.resource.billing_agreement_id;
        if (subscriptionId) {
          console.log("✅ Payment completed for subscription:", subscriptionId);
          // Could store payment records here if needed
        }
        break;

      default:
        console.log("Unhandled webhook event:", event.event_type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}