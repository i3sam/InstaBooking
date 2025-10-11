import { Request, Response } from "express";
import crypto from "crypto";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID) {
  throw new Error("Missing PAYPAL_CLIENT_ID");
}
if (!PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PAYPAL_CLIENT_SECRET");
}

// PayPal API base URLs
const PAYPAL_API_BASE = 
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// Store plan IDs in memory - will search for existing plans on startup
let PRO_PLAN_ID: string | null = null;
const PRO_PLAN_NAME = "BookingGen Pro Monthly";

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

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

// Create a product
async function createProduct(accessToken: string): Promise<string> {
  const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `PRODUCT-${Date.now()}`,
    },
    body: JSON.stringify({
      name: "BookingGen Pro",
      description: "Professional booking page solution with unlimited features",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create product: ${error}`);
  }

  const data = await response.json();
  console.log("Created PayPal product:", data.id);
  return data.id;
}

// Create a subscription plan
async function createPlan(accessToken: string, productId: string): Promise<string> {
  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `PLAN-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: "BookingGen Pro Monthly",
      description: "Monthly subscription for BookingGen Pro with all features unlocked",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 means infinite
          pricing_scheme: {
            fixed_price: {
              value: "14.99",
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create plan: ${error}`);
  }

  const data = await response.json();
  console.log("Created PayPal billing plan:", data.id);
  return data.id;
}

// Search for existing plan by name
async function findExistingPlan(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans?page_size=20&total_required=true`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to search plans:", await response.text());
      return null;
    }

    const data = await response.json();
    const existingPlan = data.plans?.find((plan: any) => plan.name === PRO_PLAN_NAME);
    
    if (existingPlan) {
      console.log(`Found existing PayPal plan: ${existingPlan.id}`);
      return existingPlan.id;
    }
    
    return null;
  } catch (error) {
    console.error("Error searching for existing plans:", error);
    return null;
  }
}

// Get or create Pro subscription plan
export async function getOrCreateProPlan(): Promise<string> {
  if (PRO_PLAN_ID) {
    return PRO_PLAN_ID;
  }

  try {
    const accessToken = await getAccessToken();
    
    // First, try to find existing plan
    const existingPlanId = await findExistingPlan(accessToken);
    if (existingPlanId) {
      PRO_PLAN_ID = existingPlanId;
      console.log(`Using existing PayPal Pro plan: ${existingPlanId}`);
      return existingPlanId;
    }

    console.log("No existing plan found, creating new PayPal Pro plan...");
    
    // Create product first
    const productId = await createProduct(accessToken);
    
    // Then create billing plan
    const planId = await createPlan(accessToken, productId);
    
    PRO_PLAN_ID = planId;
    console.log(`✅ PayPal Pro Plan created successfully: ${planId}`);
    return planId;
  } catch (error) {
    console.error("Failed to create PayPal plan:", error);
    throw error;
  }
}

// Create a subscription
export async function createPayPalSubscription(req: Request, res: Response) {
  try {
    const { userId, userEmail, userName } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: "userId and userEmail are required" 
      });
    }

    console.log(`Creating PayPal subscription for user ${userId} (${userEmail})`);

    const accessToken = await getAccessToken();
    const planId = await getOrCreateProPlan();

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.bookinggen.xyz' 
      : 'http://localhost:5000';

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `SUB-${Date.now()}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          name: {
            given_name: userName || "User",
          },
          email_address: userEmail,
        },
        application_context: {
          brand_name: "BookingGen",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: `${baseUrl}/dashboard?paypal_success=true`,
          cancel_url: `${baseUrl}/dashboard?paypal_canceled=true`,
        },
        custom_id: userId, // Store userId for webhook processing
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create subscription: ${error}`);
    }

    const data = await response.json();
    console.log("✅ Created PayPal subscription:", data.id);

    const approvalUrl = data.links?.find((link: any) => link.rel === "approve")?.href;
    
    if (!approvalUrl) {
      throw new Error("No approval URL returned from PayPal");
    }

    res.json({
      subscriptionId: data.id,
      approvalUrl: approvalUrl,
      status: data.status,
    });
  } catch (error: any) {
    console.error("❌ Failed to create PayPal subscription:", error);
    res.status(500).json({ 
      error: "Failed to create subscription",
      details: error.message || "Unknown error occurred"
    });
  }
}

// Get subscription details
export async function getPayPalSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get subscription: ${error}`);
    }

    const data = await response.json();
    console.log(`PayPal subscription ${subscriptionId} status: ${data.status}`);
    res.json(data);
  } catch (error: any) {
    console.error("Failed to get PayPal subscription:", error);
    res.status(500).json({ 
      error: "Failed to get subscription details",
      details: error.message || "Unknown error occurred"
    });
  }
}

// Check and activate subscription if needed (fallback for delayed webhooks)
export async function checkAndActivateSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.body;
    const authReq = req as any;

    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID required" });
    }

    console.log(`Checking PayPal subscription status for ${subscriptionId}...`);

    // Fetch subscription details from PayPal
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get subscription: ${error}`);
    }

    const subscription = await response.json();
    const userId = authReq.user.userId;

    // Verify this subscription belongs to the authenticated user
    if (subscription.custom_id !== userId) {
      return res.status(403).json({ error: "Subscription does not belong to user" });
    }

    // Check if subscription is active or activated
    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED') {
      // Import storage
      const { storage } = await import("./storage");
      
      // Check if already activated in our database
      const existingSubscription = await storage.getSubscription(subscriptionId);
      
      if (!existingSubscription) {
        // Webhook hasn't processed yet, activate manually
        const currentDate = new Date();
        const nextBillingDate = subscription.billing_info?.next_billing_time 
          ? new Date(subscription.billing_info.next_billing_time)
          : new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Update user profile to Pro
        await storage.updateProfile(userId, {
          membershipStatus: "pro",
          membershipPlan: "pro-monthly",
          membershipExpires: nextBillingDate,
        });

        // Store subscription details
        await storage.createSubscription({
          id: subscriptionId,
          userId: userId,
          status: subscription.status,
          planId: subscription.plan_id,
          currentPeriodStart: currentDate,
          currentPeriodEnd: nextBillingDate,
          planName: "pro",
          currency: "USD",
          amount: "14.99",
          startTime: currentDate,
          nextBillingTime: nextBillingDate,
          isTrial: false,
        });

        console.log(`✅ Manually activated subscription ${subscriptionId} for user ${userId}`);
        
        return res.json({ 
          success: true,
          activated: true,
          message: "Subscription activated successfully" 
        });
      } else {
        console.log(`Subscription ${subscriptionId} already activated`);
        return res.json({ 
          success: true,
          activated: false,
          message: "Subscription already active" 
        });
      }
    } else {
      return res.json({ 
        success: false,
        status: subscription.status,
        message: `Subscription status is ${subscription.status}` 
      });
    }
  } catch (error: any) {
    console.error("❌ Failed to check subscription:", error);
    res.status(500).json({ 
      error: "Failed to check subscription",
      details: error.message || "Unknown error occurred"
    });
  }
}

// Cancel subscription
export async function cancelPayPalSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;
    const accessToken = await getAccessToken();

    console.log(`Cancelling PayPal subscription ${subscriptionId}...`);

    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason || "Customer requested cancellation",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to cancel subscription: ${error}`);
    }

    console.log(`✅ PayPal subscription ${subscriptionId} cancelled successfully`);

    res.json({ 
      success: true,
      message: "Subscription canceled successfully" 
    });
  } catch (error: any) {
    console.error("❌ Failed to cancel PayPal subscription:", error);
    res.status(500).json({ 
      error: "Failed to cancel subscription",
      details: error.message || "Unknown error occurred"
    });
  }
}

