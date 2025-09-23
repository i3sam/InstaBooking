import Razorpay from 'razorpay';
import { Request, Response } from 'express';
import { storage } from './storage';
import crypto from 'crypto';

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

// Server-side price configuration - only these prices are valid
const PLAN_PRICING: Record<string, { amount: number; currency: string; duration: number }> = {
  'pro': { amount: 14.99, currency: 'USD', duration: 30 }, // 30 days
};

let razorpay: Razorpay | null = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('Razorpay credentials not found - Razorpay payments will be unavailable');
}

// Storage now handled by Supabase via storage.ts interface

// Cache for subscription plans
let subscriptionPlans: Map<string, string> = new Map();

// Create subscription plan if it doesn't exist
export async function createSubscriptionPlan(planName: string, amount: number, currency: string): Promise<string> {
  if (!razorpay) {
    throw new Error('Razorpay not initialized');
  }

  try {
    // Check if plan already exists
    if (subscriptionPlans.has(planName)) {
      return subscriptionPlans.get(planName)!;
    }

    const plan = await razorpay.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`,
        description: `Monthly ${planName} subscription`,
        amount: Math.round(amount * 100), // Convert to smallest unit
        currency: currency
      },
      notes: {
        plan: planName,
        type: 'subscription'
      }
    });

    subscriptionPlans.set(planName, plan.id);
    console.log(`✅ Razorpay subscription plan created: ${plan.id} for ${planName}`);
    return plan.id;
  } catch (error) {
    console.error('Failed to create Razorpay subscription plan:', error);
    throw error;
  }
}

// Create subscription
export async function createRazorpaySubscription(req: Request, res: Response) {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay service not available" });
    }

    const { plan = 'pro' } = req.body;
    const authReq = req as any;
    
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Server-side pricing
    const planConfig = PLAN_PRICING[plan];
    if (!planConfig) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Create subscription plan if needed
    const planId = await createSubscriptionPlan(plan, planConfig.amount, planConfig.currency);

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 120, // 120 monthly payments (10 years)
      notes: {
        userId: authReq.user.userId,
        plan: plan,
        serverAmount: planConfig.amount.toString()
      }
    }) as any;

    // Store subscription details in Supabase
    await storage.createSubscription({
      id: subscription.id,
      userId: authReq.user.userId,
      planId: planId,
      planName: plan,
      status: subscription.status,
      currency: planConfig.currency,
      amount: planConfig.amount
    });

    console.log(`✅ Razorpay subscription created: ${subscription.id} for user ${authReq.user.userId}`);
    
    res.json({
      subscriptionId: subscription.id,
      planId: planId,
      status: subscription.status,
      short_url: subscription.short_url,
      key: RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Failed to create Razorpay subscription:", error);
    res.status(500).json({ error: "Failed to create subscription." });
  }
}

export async function createRazorpayOrder(req: Request, res: Response) {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay service not available" });
    }

    const { plan = 'pro' } = req.body;
    const authReq = req as any;
    
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Server-side pricing - ignore any client-provided amount
    const planConfig = PLAN_PRICING[plan];
    if (!planConfig) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Convert amount to smallest currency unit (cents for USD)
    const amountInSmallestUnit = Math.round(planConfig.amount * 100);

    // Generate short receipt (max 40 chars) - use timestamp + short user ID hash
    const shortUserId = authReq.user.userId.substring(0, 8);
    const timestamp = Date.now();
    const receipt = `rcpt_${timestamp}_${shortUserId}`;
    
    const options = {
      amount: amountInSmallestUnit,
      currency: planConfig.currency,
      receipt: receipt,
      notes: {
        plan: plan,
        userId: authReq.user.userId,
        serverAmount: planConfig.amount.toString(),
        timestamp: new Date().toISOString(),
        subscriptionType: 'monthly'
      }
    };

    const order = await razorpay.orders.create(options);
    
    // Store order details in Supabase storage
    await storage.createOrder({
      orderId: order.id,
      userId: authReq.user.userId,
      plan: plan,
      amount: planConfig.amount,
      currency: planConfig.currency,
      used: false
    });
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

// Get subscription status
export async function getRazorpaySubscription(req: Request, res: Response) {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay service not available" });
    }

    const { subscriptionId } = req.params;
    const authReq = req as any;
    
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if subscription belongs to user
    const storedSub = await storage.getSubscription(subscriptionId);
    if (!storedSub || storedSub.userId !== authReq.user.userId) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Fetch current status from Razorpay
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    
    // Update subscription status in database
    await storage.updateSubscription(subscriptionId, {
      status: subscription.status
    });

    // If subscription is active and user is not pro, update profile
    if (subscription.status === 'active') {
      const profile = await storage.getProfile(authReq.user.userId);
      if (profile && profile.membershipStatus !== 'pro') {
        const planConfig = PLAN_PRICING[storedSub.planName];
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + planConfig.duration);

        await storage.updateProfile(authReq.user.userId, {
          membershipStatus: 'pro',
          membershipExpires: expiresAt.toISOString()
        });

        console.log(`✅ Updated user ${authReq.user.userId} to Pro via subscription check`);
      }
    }

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: storedSub.planId,
      plan: storedSub.planName
    });
  } catch (error) {
    console.error('Failed to get Razorpay subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
}

// Handle subscription webhook
export async function handleRazorpayWebhook(req: Request, res: Response) {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Razorpay webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature using raw body (Buffer from express.raw)
    const expectedSignature = crypto.createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      console.warn('Invalid webhook signature received');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Parse JSON after signature verification
    const event = JSON.parse(req.body.toString());

    console.log('Razorpay webhook received:', event.event);

    // Handle subscription events
    switch (event.event) {
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
        break;
      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity);
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      case 'subscription.paused':
        await handleSubscriptionPaused(event.payload.subscription.entity);
        break;
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Webhook event handlers
async function handleSubscriptionCharged(subscription: any, payment: any) {
  try {
    const storedSub = await storage.getSubscription(subscription.id);
    if (!storedSub) {
      console.warn(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update user membership
    const planConfig = PLAN_PRICING[storedSub.planName];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planConfig.duration);

    await storage.createPayment({
      userId: storedSub.userId,
      plan: storedSub.planName,
      amount: (payment.amount / 100).toString(), // Convert from smallest unit
      status: "completed",
      paymentId: payment.id,
      paymentMethod: "razorpay_subscription",
      meta: {
        razorpay_subscription_id: subscription.id,
        razorpay_payment_id: payment.id,
        subscription_status: subscription.status,
        completedAt: new Date().toISOString()
      }
    });

    await storage.updateProfile(storedSub.userId, {
      membershipStatus: 'pro',
      membershipExpires: expiresAt.toISOString()
    });

    // Update subscription status in database
    await storage.updateSubscription(subscription.id, {
      status: subscription.status
    });

    console.log(`✅ Subscription payment processed for user ${storedSub.userId}`);
  } catch (error) {
    console.error('Failed to process subscription charge:', error);
  }
}

async function handleSubscriptionCompleted(subscription: any) {
  console.log(`Subscription completed: ${subscription.id}`);
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const storedSub = await storage.getSubscription(subscription.id);
    if (storedSub) {
      // Update subscription status to cancelled
      await storage.updateSubscription(subscription.id, {
        status: 'cancelled'
      });

      // Downgrade user to free when subscription is actually cancelled
      const profile = await storage.getProfile(storedSub.userId);
      if (profile) {
        await storage.updateProfile(storedSub.userId, {
          membershipStatus: 'free',
          membershipPlan: null,
          membershipExpires: null // Clear expiry since they're now on free plan
        });
      }
      
      console.log(`✅ Subscription cancelled and user ${storedSub.userId} downgraded to free: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Failed to handle subscription cancellation:', error);
  }
}

async function handleSubscriptionPaused(subscription: any) {
  try {
    const storedSub = await storage.getSubscription(subscription.id);
    if (storedSub) {
      await storage.updateSubscription(subscription.id, {
        status: 'paused'
      });
      console.log(`Subscription paused: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Failed to handle subscription pause:', error);
  }
}

export async function verifyRazorpayPayment(req: Request, res: Response) {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay service not available" });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const authReq = req as any;

    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error: "Missing payment verification parameters"
      });
    }

    // Verify the signature using proper crypto import
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Check if order exists and belongs to this user
    const storedOrder = await storage.getOrder(razorpayOrderId);
    if (!storedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (storedOrder.userId !== authReq.user.userId) {
      return res.status(403).json({ error: "Order does not belong to user" });
    }

    if (storedOrder.used) {
      return res.status(400).json({ error: "Order already used" });
    }

    // Fetch payment details from Razorpay for verification
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ error: "Payment not captured" });
    }

    // Verify payment amount matches server-side pricing
    const planConfig = PLAN_PRICING[storedOrder.plan];
    const expectedAmountInSmallestUnit = Math.round(planConfig.amount * 100);
    
    if (payment.amount !== expectedAmountInSmallestUnit) {
      return res.status(400).json({ error: "Payment amount mismatch" });
    }

    if (payment.currency !== planConfig.currency) {
      return res.status(400).json({ error: "Payment currency mismatch" });
    }

    if (razorpayOrder.status !== 'paid') {
      return res.status(400).json({ error: "Order not paid" });
    }

    // Mark order as used
    await storage.updateOrder(razorpayOrderId, { used: true });

    // Store payment record using trusted values from Razorpay and server config
    await storage.createPayment({
      userId: authReq.user.userId,
      plan: storedOrder.plan,
      amount: planConfig.amount.toString(),
      status: "completed",
      paymentId: razorpayPaymentId,
      paymentMethod: "razorpay",
      meta: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        amount_verified: payment.amount,
        currency_verified: payment.currency,
        completedAt: new Date().toISOString()
      }
    });

    // Update user membership using server-side configuration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + planConfig.duration);

    await storage.updateProfile(authReq.user.userId, {
      membershipStatus: 'pro',
      membershipExpires: expiresAt.toISOString()
    });

    console.log(`Successfully upgraded user ${authReq.user.userId} to ${storedOrder.plan} via Razorpay payment ${razorpayPaymentId}`);

    res.json({
      success: true,
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
      membershipStatus: 'pro',
      membershipExpires: expiresAt.toISOString()
    });

  } catch (error) {
    console.error("Razorpay payment verification failed:", error);
    res.status(500).json({ error: "Payment verification failed." });
  }
}

// Cancel subscription
export async function cancelRazorpaySubscription(req: Request, res: Response) {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay service not available" });
    }

    const authReq = req as any;
    
    if (!authReq.user || !authReq.user.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user's active subscriptions
    const userSubscriptions = await storage.getSubscriptionsByUser(authReq.user.userId);
    const activeSubscription = userSubscriptions.find(sub => 
      sub.status === 'active' || sub.status === 'ACTIVE'
    );

    if (!activeSubscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Check if subscription is already cancelled or scheduled for cancellation
    if (activeSubscription.status === 'cancelled' || activeSubscription.status === 'CANCELLED') {
      return res.status(409).json({ 
        error: "Subscription is already cancelled",
        message: "Your subscription has already been cancelled."
      });
    }

    // Cancel with Razorpay - cancel at end of billing cycle
    await razorpay.subscriptions.cancel(activeSubscription.id, {
      cancel_at_cycle_end: true
    } as any);

    // Do NOT update subscription status or user profile here
    // Let the webhook handle the final cancellation when the period ends
    // The subscription should remain 'active' until Razorpay sends the cancellation webhook

    console.log(`✅ Subscription cancelled: ${activeSubscription.id} for user ${authReq.user.userId}`);
    
    res.json({
      success: true,
      message: "Subscription cancelled successfully. You'll continue to have access until the end of your billing period.",
      subscriptionId: activeSubscription.id
    });
  } catch (error) {
    console.error("Failed to cancel Razorpay subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription." });
  }
}