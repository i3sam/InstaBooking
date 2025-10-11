import { Request, Response } from "express";
import { storage } from "./storage";
import crypto from "crypto";

const PAYPAL_API_BASE = 
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

// Get PayPal access token for webhook verification
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Verify PayPal webhook signature using PayPal API
async function verifyWebhookSignature(
  webhookId: string,
  headers: any,
  body: string
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();

    const verificationData = {
      transmission_id: headers["paypal-transmission-id"],
      transmission_time: headers["paypal-transmission-time"],
      cert_url: headers["paypal-cert-url"],
      auth_algo: headers["paypal-auth-algo"],
      transmission_sig: headers["paypal-transmission-sig"],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const response = await fetch(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      }
    );

    if (!response.ok) {
      console.error("Webhook verification failed:", await response.text());
      return false;
    }

    const result = await response.json();
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Webhook verification error:", error);
    return false;
  }
}

// PayPal Webhook Event Handler
export async function handlePayPalWebhook(req: Request, res: Response) {
  try {
    // Parse the raw body
    const rawBody = req.body.toString('utf8');
    const event = JSON.parse(rawBody);
    
    console.log("Received PayPal webhook event:", event.event_type);

    // SECURITY: Require webhook ID for signature verification
    // Only allow unverified webhooks in development mode with explicit flag
    const allowUnverifiedWebhooks = process.env.NODE_ENV === 'development' && process.env.PAYPAL_ALLOW_UNVERIFIED_WEBHOOKS === 'true';
    
    if (!PAYPAL_WEBHOOK_ID && !allowUnverifiedWebhooks) {
      console.error("❌ PAYPAL_WEBHOOK_ID not configured and unverified webhooks are not allowed");
      console.error("❌ Set PAYPAL_WEBHOOK_ID for production or PAYPAL_ALLOW_UNVERIFIED_WEBHOOKS=true for development");
      return res.status(500).json({ error: "Webhook verification not configured" });
    }

    // Verify webhook signature
    if (PAYPAL_WEBHOOK_ID) {
      const isValid = await verifyWebhookSignature(
        PAYPAL_WEBHOOK_ID,
        req.headers,
        rawBody
      );

      if (!isValid) {
        console.error("Invalid PayPal webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      console.log("PayPal webhook signature verified successfully");
    } else {
      console.warn("⚠️ DEVELOPMENT MODE: Processing webhook without signature verification");
      console.warn("⚠️ This is ONLY safe in development. DO NOT use in production!");
    }

    // Handle different event types
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(event);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(event);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(event);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(event);
        break;

      case "BILLING.SUBSCRIPTION.EXPIRED":
        await handleSubscriptionExpired(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    // Always respond with 200 OK to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

// Handle subscription activated event
async function handleSubscriptionActivated(event: any) {
  try {
    const subscription = event.resource;
    const subscriptionId = subscription.id;
    const userId = subscription.custom_id; // We store userId in custom_id when creating subscription
    const planId = subscription.plan_id;
    const status = subscription.status;

    console.log("Subscription activated:", {
      subscriptionId,
      userId,
      status,
    });

    if (!userId) {
      console.error("No userId found in subscription custom_id");
      return;
    }

    // Calculate subscription period
    const currentDate = new Date();
    const nextBillingDate = subscription.billing_info?.next_billing_time 
      ? new Date(subscription.billing_info.next_billing_time)
      : new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Update user profile to Pro (convert dates to ISO strings)
    await storage.updateProfile(userId, {
      membershipStatus: "pro",
      membershipPlan: "pro-monthly",
      membershipExpires: nextBillingDate.toISOString(),
    });

    // Store subscription details in database (convert dates to ISO strings)
    await storage.createSubscription({
      id: subscriptionId,
      userId: userId,
      status: status,
      planId: planId,
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: nextBillingDate.toISOString(),
      planName: "pro",
      currency: "USD",
      amount: "14.99",
      startTime: currentDate.toISOString(),
      nextBillingTime: nextBillingDate.toISOString(),
      isTrial: false,
    });

    console.log(`User ${userId} upgraded to Pro via PayPal subscription ${subscriptionId}`);
  } catch (error) {
    console.error("Error handling subscription activation:", error);
    throw error;
  }
}

// Handle payment completed event (recurring payments)
async function handlePaymentCompleted(event: any) {
  try {
    const sale = event.resource;
    const subscriptionId = sale.billing_agreement_id;

    if (!subscriptionId) {
      console.log("Payment not related to subscription, skipping");
      return;
    }

    console.log("Recurring payment completed:", {
      subscriptionId,
      amount: sale.amount?.total,
      currency: sale.amount?.currency,
    });

    // Get subscription from database
    const subscription = await storage.getSubscription(subscriptionId);
    
    if (!subscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }

    // Update subscription billing dates
    const currentDate = new Date();
    const nextBillingDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    await storage.updateSubscription(subscriptionId, {
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: nextBillingDate.toISOString(),
      nextBillingTime: nextBillingDate.toISOString(),
      status: "ACTIVE",
    });

    // Ensure user profile is still Pro (convert dates to ISO strings)
    await storage.updateProfile(subscription.userId, {
      membershipStatus: "pro",
      membershipExpires: nextBillingDate.toISOString(),
    });

    console.log(`Subscription ${subscriptionId} renewed successfully`);
  } catch (error) {
    console.error("Error handling payment completion:", error);
    throw error;
  }
}

// Handle subscription cancelled event
async function handleSubscriptionCancelled(event: any) {
  try {
    const subscription = event.resource;
    const subscriptionId = subscription.id;

    console.log("Subscription cancelled:", subscriptionId);

    // Get subscription from database
    const dbSubscription = await storage.getSubscription(subscriptionId);
    
    if (!dbSubscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }

    // Update subscription status
    await storage.updateSubscription(subscriptionId, {
      status: "CANCELLED",
    });

    // Downgrade user to free at the end of the current billing period
    // Don't immediately revoke access - let them use it until period ends
    console.log(`Subscription ${subscriptionId} marked as cancelled. Access will end on ${dbSubscription.currentPeriodEnd}`);
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    throw error;
  }
}

// Handle subscription suspended event
async function handleSubscriptionSuspended(event: any) {
  try {
    const subscription = event.resource;
    const subscriptionId = subscription.id;

    console.log("Subscription suspended:", subscriptionId);

    // Get subscription from database
    const dbSubscription = await storage.getSubscription(subscriptionId);
    
    if (!dbSubscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }

    // Update subscription status
    await storage.updateSubscription(subscriptionId, {
      status: "SUSPENDED",
    });

    // Downgrade user to free immediately
    await storage.updateProfile(dbSubscription.userId, {
      membershipStatus: "free",
      membershipPlan: null,
      membershipExpires: null,
    });

    console.log(`User ${dbSubscription.userId} downgraded to free due to suspended subscription`);
  } catch (error) {
    console.error("Error handling subscription suspension:", error);
    throw error;
  }
}

// Handle subscription expired event
async function handleSubscriptionExpired(event: any) {
  try {
    const subscription = event.resource;
    const subscriptionId = subscription.id;

    console.log("Subscription expired:", subscriptionId);

    // Get subscription from database
    const dbSubscription = await storage.getSubscription(subscriptionId);
    
    if (!dbSubscription) {
      console.error("Subscription not found:", subscriptionId);
      return;
    }

    // Update subscription status
    await storage.updateSubscription(subscriptionId, {
      status: "EXPIRED",
    });

    // Downgrade user to free
    await storage.updateProfile(dbSubscription.userId, {
      membershipStatus: "free",
      membershipPlan: null,
      membershipExpires: null,
    });

    console.log(`User ${dbSubscription.userId} downgraded to free due to expired subscription`);
  } catch (error) {
    console.error("Error handling subscription expiration:", error);
    throw error;
  }
}
