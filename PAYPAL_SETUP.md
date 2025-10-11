# PayPal Subscription Setup Guide

## Overview

Your application uses **PayPal Subscriptions** for recurring monthly payments ($14.99/month). The integration is fully functional and includes:

✅ Automatic subscription creation and management
✅ Recurring billing (monthly)
✅ Webhook-based membership activation
✅ Automatic membership renewal and cancellation handling

## Required Environment Variables

You need to configure these environment variables:

### Backend (Already Configured ✅)
- `PAYPAL_CLIENT_ID` - Your PayPal REST API Client ID
- `PAYPAL_CLIENT_SECRET` - Your PayPal REST API Secret

### Frontend (NEEDS SETUP ⚠️)
- `VITE_PAYPAL_CLIENT_ID` - Same as PAYPAL_CLIENT_ID (for frontend PayPal button)

### Webhook (NEEDS SETUP ⚠️)
- `PAYPAL_WEBHOOK_ID` - Webhook ID from PayPal Dashboard (for signature verification)
- `PAYPAL_ALLOW_UNVERIFIED_WEBHOOKS` - (Development only) Set to `true` to allow webhooks without signature verification. **NEVER use in production!**

## Setting Up PayPal Webhooks

Webhooks are **CRITICAL** for your SaaS to work properly. Without webhooks, subscriptions won't activate user memberships.

### Step 1: Get Your Webhook URL

Your webhook endpoint is:
```
https://your-replit-domain.replit.app/api/paypal/webhook
```

For production:
```
https://www.bookinggen.xyz/api/paypal/webhook
```

### Step 2: Create Webhook in PayPal Dashboard

1. **Login to PayPal Developer Dashboard**
   - Sandbox: https://developer.paypal.com/dashboard/
   - Production: https://www.paypal.com/businessmanage/

2. **Navigate to Webhooks**
   - Go to "Apps & Credentials"
   - Select your app
   - Scroll down to "Webhooks" section
   - Click "Add Webhook"

3. **Configure Webhook**
   - **Webhook URL**: Enter your webhook endpoint URL (from Step 1)
   - **Event types**: Select these events:
     - ✅ `BILLING.SUBSCRIPTION.ACTIVATED` (Required - activates Pro membership)
     - ✅ `PAYMENT.SALE.COMPLETED` (Required - renews subscription)
     - ✅ `BILLING.SUBSCRIPTION.CANCELLED` (Required - handles cancellations)
     - ✅ `BILLING.SUBSCRIPTION.SUSPENDED` (Required - handles payment failures)
     - ✅ `BILLING.SUBSCRIPTION.EXPIRED` (Required - handles expiration)

4. **Save and Get Webhook ID**
   - After saving, you'll see a Webhook ID (format: `WH-XXXXX-XXXXX`)
   - **Copy this ID** - you'll need it for the next step

### Step 3: Add Webhook ID to Environment Variables

You need to add the `PAYPAL_WEBHOOK_ID` environment variable with the ID from Step 2.

**Important**: The frontend also needs `VITE_PAYPAL_CLIENT_ID` set to the same value as `PAYPAL_CLIENT_ID`.

## How the PayPal Flow Works

### User Subscribe Flow:
1. User clicks "Subscribe with PayPal" button
2. Frontend loads PayPal SDK and creates subscription via backend
3. User is redirected to PayPal to approve subscription
4. User approves and is redirected back to your app
5. **Primary Path (Webhook):**
   - PayPal sends `BILLING.SUBSCRIPTION.ACTIVATED` webhook
   - Backend receives webhook, verifies signature, and activates Pro membership
6. **Fallback Path (if webhook delayed):**
   - Frontend detects membership not activated
   - Calls fallback endpoint to check PayPal subscription status
   - Backend verifies subscription with PayPal API and activates membership
7. User now has active Pro subscription

This dual-path approach ensures reliable activation even if webhooks are delayed or missed.

### Recurring Billing:
1. PayPal automatically charges user monthly
2. **PayPal sends `PAYMENT.SALE.COMPLETED` webhook**
3. Backend receives webhook and extends membership by 30 days
4. User's Pro membership continues

### Cancellation:
1. User cancels subscription (via PayPal or your app)
2. **PayPal sends `BILLING.SUBSCRIPTION.CANCELLED` webhook**
3. Backend marks subscription as cancelled
4. User keeps access until current billing period ends
5. After period ends, user is downgraded to free

## Webhook Events Handled

| Event | What Happens |
|-------|-------------|
| `BILLING.SUBSCRIPTION.ACTIVATED` | ✅ Activates Pro membership, stores subscription in DB |
| `PAYMENT.SALE.COMPLETED` | ✅ Renews subscription, extends membership by 30 days |
| `BILLING.SUBSCRIPTION.CANCELLED` | ⚠️ Marks as cancelled, user keeps access until period ends |
| `BILLING.SUBSCRIPTION.SUSPENDED` | ❌ Immediately downgrades to free (payment failure) |
| `BILLING.SUBSCRIPTION.EXPIRED` | ❌ Downgrades to free (subscription ended) |

## Testing

### Testing with Sandbox

1. Use PayPal Sandbox credentials
2. Set `NODE_ENV=development` (automatically uses sandbox URLs)
3. Create test subscriptions with sandbox accounts
4. Monitor webhook events in PayPal Developer Dashboard

### Testing Webhooks Locally

PayPal webhooks need a public URL. For local testing:
- Use your published Replit URL
- Or use a tool like ngrok to expose localhost

## Security Features

✅ **Webhook Signature Verification** - All webhooks are verified using PayPal's signature verification API
✅ **User Validation** - Subscription user ID is validated against authenticated user
✅ **Environment-based URLs** - Automatically switches between sandbox and production
✅ **Secure Token Handling** - PayPal tokens are generated securely server-side

## Troubleshooting

### Subscription not activating?
- Check if `PAYPAL_WEBHOOK_ID` is configured
- Verify webhook URL is correct in PayPal Dashboard
- Check server logs for webhook events
- Ensure all required webhook events are subscribed

### "PayPal not configured" error?
- Make sure `VITE_PAYPAL_CLIENT_ID` is set for frontend
- Restart the application after adding environment variables

### Webhook signature verification failing?
- Ensure `PAYPAL_WEBHOOK_ID` matches the ID from PayPal Dashboard
- Verify you're using the correct environment (sandbox vs production)
- Check that webhook URL in PayPal matches your actual endpoint

## Production Checklist

Before going live:

- [ ] Switch from Sandbox to Live PayPal credentials
- [ ] Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` with live credentials
- [ ] Update `VITE_PAYPAL_CLIENT_ID` with live client ID
- [ ] Create webhook in **Live** PayPal Dashboard (not sandbox)
- [ ] Set `PAYPAL_WEBHOOK_ID` to the live webhook ID
- [ ] Set `NODE_ENV=production`
- [ ] Test subscription flow end-to-end
- [ ] Verify webhooks are received and processed
- [ ] Monitor logs for any errors

## Support

If you encounter issues:
1. Check server logs for webhook events
2. Verify all environment variables are set correctly
3. Test with PayPal sandbox first
4. Check PayPal Developer Dashboard for webhook delivery status
