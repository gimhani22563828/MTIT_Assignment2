const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Order Service API',
        version: '1.0.0',
        description: 'Microservice for order creation, tracking, and management'
    },
    servers: [
        { url: 'http://localhost:3003', description: 'Direct Order Service' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    paths: {
        '/orders': {
            post: {
                tags: ['Orders'],
                summary: 'Create a new order',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'restaurantId', 'items', 'totalAmount', 'location'],
                                properties: {
                                    userId: { type: 'string', example: '6651234567890abcdef12345' },
                                    restaurantId: { type: 'string', example: '6651234567890abcdef12346' },
                                    items: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                menuId: { type: 'string' },
                                                name: { type: 'string', example: 'Chicken Rice' },
                                                price: { type: 'number', example: 500 },
                                                quantity: { type: 'number', example: 2 }
                                            }
                                        }
                                    },
                                    totalAmount: { type: 'number', example: 1000 },
                                    location: { type: 'string', example: 'Colombo 07' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Order created successfully' },
                    '400': { description: 'Missing required order fields' }
                }
            },
            get: {
                tags: ['Orders'],
                summary: 'Get all orders (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of all orders with successful payments' },
                    '403': { description: 'Admin access required' }
                }
            }
        },
        '/orders/{userId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get orders by user ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' }, description: 'User ID' }],
                responses: {
                    '200': { description: 'List of user orders with successful payments' },
                    '400': { description: 'Invalid userId format' }
                }
            }
        },
        '/orders/details/{orderId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order details by order ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' }, description: 'Order ID' }],
                responses: {
                    '200': { description: 'Order details returned' },
                    '404': { description: 'Order not found' }
                }
            }
        },
        '/orders/{id}/status': {
            put: {
                tags: ['Orders'],
                summary: 'Update order status',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Order ID' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['orderStatus'],
                                properties: {
                                    orderStatus: { type: 'string', enum: ['pending', 'preparing', 'ready', 'picked', 'delivering', 'delivered', 'cancelled'], example: 'preparing' },
                                    deliveryPersonId: { type: 'string' },
                                    deliveryPersonName: { type: 'string' },
                                    deliveryPersonPhone: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Order status updated successfully' },
                    '400': { description: 'Invalid status' },
                    '404': { description: 'Order not found' }
                }
            }
        },
        '/orders/{id}/ready': {
            put: {
                tags: ['Orders'],
                summary: 'Mark order as ready (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Order ID' }],
                responses: {
                    '200': { description: 'Order marked as ready' },
                    '400': { description: 'Order must be in pending or preparing status' },
                    '403': { description: 'Admin access required' }
                }
            }
        },
        '/orders/delivery-person/{deliveryPersonId}': {
            get: {
                tags: ['Delivery'],
                summary: 'Get orders for a delivery person',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'deliveryPersonId', required: true, schema: { type: 'string' }, description: 'Delivery Person User ID' }],
                responses: {
                    '200': { description: 'List of orders (ready + assigned)' },
                    '403': { description: 'Access denied' }
                }
            }
        },
        '/orders/debug/ready-orders': {
            get: {
                tags: ['Debug'],
                summary: 'Debug: Get all ready orders (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Debug info about ready orders' },
                    '403': { description: 'Admin only' }
                }
            }
        },
        '/orders/admin/cleanup-ready-orders': {
            post: {
                tags: ['Debug'],
                summary: 'Cleanup: Remove delivery person from ready orders (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'Cleanup result' },
                    '403': { description: 'Admin only' }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/orders', orderRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3003;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Order DB)');
        app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
