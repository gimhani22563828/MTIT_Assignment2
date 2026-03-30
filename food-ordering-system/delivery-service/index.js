const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const deliveryRoutes = require('./routes/deliveryRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS if needed
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`[Delivery Service] ${req.method} ${req.originalUrl}`);
    next();
});

// Disable caching for API responses
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Delivery Service API',
        version: '1.0.0',
        description: 'Microservice for delivery tracking and management'
    },
    servers: [
        { url: 'http://localhost:3005', description: 'Direct Delivery Service' }
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
        '/deliveries': {
            post: {
                tags: ['Deliveries'],
                summary: 'Create a delivery (Admin only)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['orderId', 'userId', 'address', 'deliveryAddress'],
                                properties: {
                                    orderId: { type: 'string', example: '6651234567890abcdef12345' },
                                    userId: { type: 'string', example: '6651234567890abcdef12346' },
                                    address: { type: 'string', example: 'Colombo 07' },
                                    deliveryAddress: { type: 'string', example: 'Colombo 07' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Delivery created successfully' },
                    '400': { description: 'Missing required delivery fields' }
                }
            },
            get: {
                tags: ['Deliveries'],
                summary: 'Get all deliveries (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of all deliveries' }
                }
            }
        },
        '/deliveries/order/{orderId}': {
            get: {
                tags: ['Deliveries'],
                summary: 'Get delivery by order ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' }, description: 'Order ID' }],
                responses: {
                    '200': { description: 'Delivery details for the order' },
                    '404': { description: 'Delivery not found for this order' }
                }
            }
        },
        '/deliveries/user/{userId}': {
            get: {
                tags: ['Deliveries'],
                summary: 'Get deliveries by user ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' }, description: 'User ID' }],
                responses: {
                    '200': { description: 'List of deliveries for the user' }
                }
            }
        },
        '/deliveries/{id}': {
            get: {
                tags: ['Deliveries'],
                summary: 'Get delivery by delivery ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Delivery ID' }],
                responses: {
                    '200': { description: 'Delivery details' },
                    '404': { description: 'Delivery not found' }
                }
            }
        },
        '/deliveries/{id}/status': {
            put: {
                tags: ['Deliveries'],
                summary: 'Update delivery status',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Delivery ID' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: { type: 'string', enum: ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'], example: 'in-transit' },
                                    deliveryPersonId: { type: 'string' },
                                    deliveryPersonName: { type: 'string' },
                                    deliveryPersonPhone: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Delivery status updated successfully' },
                    '400': { description: 'Invalid status value' },
                    '404': { description: 'Delivery not found' }
                }
            }
        },
        '/deliveries/{id}/assign': {
            put: {
                tags: ['Deliveries'],
                summary: 'Assign delivery person (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Delivery ID' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['deliveryPersonId', 'deliveryPersonName', 'deliveryPersonPhone'],
                                properties: {
                                    deliveryPersonId: { type: 'string', example: '6651234567890abcdef12347' },
                                    deliveryPersonName: { type: 'string', example: 'Kamal Silva' },
                                    deliveryPersonPhone: { type: 'string', example: '0771234567' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Delivery partner assigned successfully' },
                    '400': { description: 'Delivery person details are required' },
                    '404': { description: 'Delivery not found' }
                }
            }
        },
        '/deliveries/{id}/location': {
            put: {
                tags: ['Deliveries'],
                summary: 'Update delivery location',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Delivery ID' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['latitude', 'longitude'],
                                properties: {
                                    latitude: { type: 'number', example: 6.9271 },
                                    longitude: { type: 'number', example: 79.8612 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Location updated successfully' },
                    '400': { description: 'Invalid coordinates' },
                    '404': { description: 'Delivery not found' }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/deliveries', deliveryRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Delivery Service is running');
});

// Error handler - must be last middleware
app.use((err, req, res, next) => {
    console.error('[Delivery Service Error]:', err.message);
    console.error(err.stack);
    
    // Handle MongoDB errors
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({ error: 'Database error occurred' });
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Validation error: ' + err.message });
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const PORT = process.env.PORT || 3005;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Delivery DB)');
        app.listen(PORT, () => console.log(`Delivery Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
