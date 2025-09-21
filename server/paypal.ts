// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

/* PayPal Controllers Setup */

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
  environment: process.env.NODE_ENV === "production" ? Environment.Production : Environment.Sandbox, // Use sandbox in development for testing
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
const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);

/* Token generation helpers */

export async function getClientToken() {
  try {
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
    ).toString("base64");

    const { result } = await oAuthAuthorizationController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      { intent: "sdk_init", response_type: "client_token" },
    );

    return result.accessToken;
  } catch (error) {
    console.error("PayPal client token generation failed:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("PayPal authentication failed");
  }
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    // Normalize and validate intent
    const normalizedIntent = intent.toUpperCase();
    if (!["CAPTURE", "AUTHORIZE"].includes(normalizedIntent)) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Must be 'capture' or 'authorize'." });
    }

    console.log(`Creating PayPal order: ${amount} ${currency} with intent ${normalizedIntent}`);

    const collect = {
      body: {
        intent: normalizedIntent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    console.log(`PayPal order creation response: ${httpStatusCode}`, jsonResponse);
    
    if (httpStatusCode >= 400) {
      console.error("PayPal order creation failed with error:", jsonResponse);
    }

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error: any) {
    console.error("Failed to create PayPal order:", error instanceof Error ? error.message : "Unknown error");
    console.error("Full error object:", error);
    
    // Handle PayPal API errors
    if (error && typeof error === 'object') {
      if ('statusCode' in error) {
        const statusCode = error.statusCode;
        
        // Try to extract PayPal error details
        let errorDetails = error;
        if (error.body) {
          try {
            errorDetails = JSON.parse(error.body);
            console.error("PayPal API error details:", errorDetails);
          } catch (parseError) {
            console.error("Could not parse PayPal error body:", error.body);
            errorDetails = { error: error.body };
          }
        } else if (error.result) {
          errorDetails = error.result;
          console.error("PayPal API error result:", errorDetails);
        }
        
        if (statusCode === 401) {
          return res.status(503).json({ error: "PayPal service temporarily unavailable. Please check configuration." });
        }
        
        return res.status(statusCode).json(errorDetails);
      }
    }
    
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required." });
    }
    
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture PayPal order:", error instanceof Error ? error.message : "Unknown error");
    
    // Handle specific PayPal authentication errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as any).statusCode;
      if (statusCode === 401) {
        return res.status(503).json({ error: "PayPal service temporarily unavailable. Please check configuration." });
      }
    }
    
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    console.log(`PayPal environment: Production (Live) - using real credentials for live payments`);
    
    const clientToken = await getClientToken();
    res.json({
      clientToken,
    });
  } catch (error) {
    console.error("Failed to load PayPal setup:", error instanceof Error ? error.message : "Unknown error");
    res.status(503).json({ 
      error: "PayPal service temporarily unavailable. Please check configuration." 
    });
  }
}
// <END_EXACT_CODE>