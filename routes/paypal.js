import express from 'express';
import 'dotenv/config';
import {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController,
} from '@paypal/paypal-server-sdk';

const router = express.Router();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);

/**
 * Create an order for payment processing.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */

router.post('/api/orders', async (req, res) => {
  const cart = req.body.cart;
  const payload = {
    body: {
      intent: 'CAPTURE',
      purchaseUnits: [
        {
          amount: {
            currencyCode: 'USD',
            value: '100',
          },
        },
      ],
    },
    prefer: 'return=minimal',
  };
  try {
    const { body, ...httpResponse } = await ordersController.createOrder(
      payload
    );
    res.status(httpResponse.statusCode).json(JSON.parse(body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */

router.post('/api/orders/:orderID/capture', async (req, res) => {
  const { orderID } = req.params;
  const collect = {
    id: orderID,
    prefer: 'return=minimal',
  };
  try {
    const { body, ...httpResponse } = await ordersController.captureOrder(
      collect
    );
    res.status(httpResponse.statusCode).json(JSON.parse(body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Authorize payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_authorize
 */

// Authorize Order
router.post('/api/orders/:orderID/authorize', async (req, res) => {
  const { orderID } = req.params;
  const collect = {
    id: orderID,
    prefer: 'return=minimal',
  };
  try {
    const { body, ...httpResponse } = await ordersController.authorizeOrder(
      collect
    );
    res.status(httpResponse.statusCode).json(JSON.parse(body));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Captures an authorized payment, by ID.
 * @see https://developer.paypal.com/docs/api/payments/v2/#authorizations_capture
 */

// Capture Authorization
router.post(
  '/api/orders/:authorizationId/captureAuthorize',
  async (req, res) => {
    const { authorizationId } = req.params;
    const collect = {
      authorizationId: authorizationId,
      prefer: 'return=minimal',
      body: {
        finalCapture: false,
      },
    };
    try {
      const { body, ...httpResponse } =
        await paymentsController.captureAuthorize(collect);
      res.status(httpResponse.statusCode).json(JSON.parse(body));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
