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

// In-memory order storage (in production, use a database)
const orderStore = new Map<string, {
  orderId: string;
  userId: string;
  plan: string;
  amount: number;
  currency: string;
  createdAt: Date;
  used: boolean;
}>();

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

    const options = {
      amount: amountInSmallestUnit,
      currency: planConfig.currency,
      receipt: `receipt_${Date.now()}_${authReq.user.userId}`,
      notes: {
        plan: plan,
        userId: authReq.user.userId,
        serverAmount: planConfig.amount.toString(),
        timestamp: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);
    
    // Store order details tied to user
    orderStore.set(order.id, {
      orderId: order.id,
      userId: authReq.user.userId,
      plan: plan,
      amount: planConfig.amount,
      currency: planConfig.currency,
      createdAt: new Date(),
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
    const storedOrder = orderStore.get(razorpayOrderId);
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
    storedOrder.used = true;
    orderStore.set(razorpayOrderId, storedOrder);

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