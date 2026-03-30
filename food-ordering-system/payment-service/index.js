const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Payment Service API',
        version: '1.0.0',
        description: 'Microservice for processing payments (card and cash)'
    },
    servers: [
        { url: 'http://localhost:3004', description: 'Direct Payment Service' }
    ],
    paths: {
        '/payments': {
            post: {
                tags: ['Payments'],
                summary: 'Process a payment',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['orderId', 'userId', 'amount', 'paymentMethod'],
                                properties: {
                                    orderId: { type: 'string', example: '6651234567890abcdef12345' },
                                    userId: { type: 'string', example: '6651234567890abcdef12346' },
                                    amount: { type: 'number', example: 1500 },
                                    paymentMethod: { type: 'string', enum: ['card', 'cash'], example: 'card' },
                                    cardNumber: { type: 'string', example: '4111111111111111' },
                                    cardHolder: { type: 'string', example: 'John Doe' },
                                    cardExpiry: { type: 'string', example: '12/26' },
                                    cvv: { type: 'string', example: '123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Payment processed successfully' },
                    '400': { description: 'Missing required fields' }
                }
            }
        },
        '/payments/{orderId}': {
            get: {
                tags: ['Payments'],
                summary: 'Get payments by order ID',
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' }, description: 'Order ID' }],
                responses: {
                    '200': { description: 'List of payments for the order' }
                }
            }
        },
        '/payments/payment/{paymentId}': {
            get: {
                tags: ['Payments'],
                summary: 'Get payment by payment ID',
                parameters: [{ in: 'path', name: 'paymentId', required: true, schema: { type: 'string' }, description: 'Payment ID' }],
                responses: {
                    '200': { description: 'Payment details' },
                    '404': { description: 'Payment not found' }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/payments', paymentRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3004;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Payment DB)');
        app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
