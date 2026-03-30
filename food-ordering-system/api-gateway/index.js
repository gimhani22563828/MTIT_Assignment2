const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// Disable caching for API requests
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// API Gateway Swagger Document - aggregated view of all microservices
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Food Ordering System - API Gateway',
        version: '1.0.0',
        description: 'Unified API Gateway for all Food Ordering microservices. All requests go through port 3000.'
    },
    servers: [
        { url: 'http://localhost:3000', description: 'API Gateway' }
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
    tags: [
        { name: 'Users', description: 'User registration, login & profiles (→ port 3001)' },
        { name: 'Delivery Persons', description: 'Delivery person management (→ port 3001)' },
        { name: 'Restaurants', description: 'Restaurant CRUD operations (→ port 3002)' },
        { name: 'Menu', description: 'Menu item management (→ port 3002)' },
        { name: 'Orders', description: 'Order management (→ port 3003)' },
        { name: 'Payments', description: 'Payment processing (→ port 3004)' },
        { name: 'Deliveries', description: 'Delivery tracking (→ port 3005)' }
    ],
    paths: {
        // ===== USER SERVICE (port 3001) =====
        '/api/users/register': {
            post: {
                tags: ['Users'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password'],
                                properties: {
                                    name: { type: 'string', example: 'John Doe' },
                                    email: { type: 'string', example: 'john@example.com' },
                                    password: { type: 'string', example: 'password123' },
                                    role: { type: 'string', enum: ['user', 'admin', 'deliveryPerson'], example: 'user' },
                                    phone: { type: 'string', example: '0771234567' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'User registered successfully' },
                    '400': { description: 'Validation error or email already exists' }
                }
            }
        },
        '/api/users/login': {
            post: {
                tags: ['Users'],
                summary: 'Login user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'john@example.com' },
                                    password: { type: 'string', example: 'password123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Login successful, returns JWT token' },
                    '401': { description: 'Invalid credentials' }
                }
            }
        },
        '/api/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user profile by ID',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }],
                responses: {
                    '200': { description: 'User profile' },
                    '404': { description: 'User not found' }
                }
            }
        },
        '/api/users/delivery-persons': {
            get: {
                tags: ['Delivery Persons'],
                summary: 'Get all delivery persons (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of all delivery persons' },
                    '403': { description: 'Only admins can view delivery persons' }
                }
            }
        },
        '/api/users/delivery-persons/available': {
            get: {
                tags: ['Delivery Persons'],
                summary: 'Get available delivery persons (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of available delivery persons' },
                    '403': { description: 'Only admins can view delivery persons' }
                }
            }
        },

        // ===== RESTAURANT SERVICE (port 3002) =====
        '/api/restaurants': {
            post: {
                tags: ['Restaurants'],
                summary: 'Add a new restaurant (Admin only)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['name', 'address'],
                                properties: {
                                    name: { type: 'string', example: 'Pizza Palace' },
                                    address: { type: 'string', example: 'Colombo 03' },
                                    cuisineType: { type: 'string', example: 'Italian' },
                                    lat: { type: 'number', example: 6.9271 },
                                    lng: { type: 'number', example: 79.8612 },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Restaurant created' },
                    '400': { description: 'Name and address are required' }
                }
            },
            get: {
                tags: ['Restaurants'],
                summary: 'Get all restaurants',
                responses: { '200': { description: 'List of all restaurants' } }
            }
        },
        '/api/restaurants/{id}': {
            put: {
                tags: ['Restaurants'],
                summary: 'Update a restaurant (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    address: { type: 'string' },
                                    cuisineType: { type: 'string' },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Restaurant updated' } }
            },
            delete: {
                tags: ['Restaurants'],
                summary: 'Delete a restaurant (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Restaurant deleted' } }
            }
        },
        '/api/restaurants/{id}/rate': {
            post: {
                tags: ['Restaurants'],
                summary: 'Rate a restaurant',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'score'],
                                properties: {
                                    userId: { type: 'string', example: '6651234567890abcdef12345' },
                                    score: { type: 'number', minimum: 1, maximum: 5, example: 4 }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Rating saved' } }
            }
        },

        // ===== MENU (port 3002) =====
        '/api/menu': {
            post: {
                tags: ['Menu'],
                summary: 'Add a menu item (Admin only)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['restaurantId', 'name', 'price'],
                                properties: {
                                    restaurantId: { type: 'string' },
                                    name: { type: 'string', example: 'Margherita Pizza' },
                                    description: { type: 'string', example: 'Classic cheese pizza' },
                                    price: { type: 'number', example: 1200 },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: { '201': { description: 'Menu item created' } }
            },
            get: {
                tags: ['Menu'],
                summary: 'Get all menu items',
                responses: { '200': { description: 'List of all menu items' } }
            }
        },
        '/api/menu/{restaurantId}': {
            get: {
                tags: ['Menu'],
                summary: 'Get menu by restaurant ID',
                parameters: [{ in: 'path', name: 'restaurantId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Menu items for the restaurant' } }
            }
        },
        '/api/menu/{id}/rate': {
            post: {
                tags: ['Menu'],
                summary: 'Rate a menu item',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'score'],
                                properties: {
                                    userId: { type: 'string' },
                                    score: { type: 'number', minimum: 1, maximum: 5, example: 5 }
                                }
                            }
                        }
                    }
                },
                responses: { '200': { description: 'Rating saved' } }
            }
        },

        // ===== ORDER SERVICE (port 3003) =====
        '/api/orders': {
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
                    '201': { description: 'Order created' },
                    '400': { description: 'Missing required fields' }
                }
            },
            get: {
                tags: ['Orders'],
                summary: 'Get all orders (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'List of all orders' } }
            }
        },
        '/api/orders/{userId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get orders by user ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'User orders' } }
            }
        },
        '/api/orders/details/{orderId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get order details by order ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Order details' } }
            }
        },
        '/api/orders/{id}/status': {
            put: {
                tags: ['Orders'],
                summary: 'Update order status',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
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
                responses: { '200': { description: 'Status updated' } }
            }
        },
        '/api/orders/{id}/ready': {
            put: {
                tags: ['Orders'],
                summary: 'Mark order as ready (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Order marked ready' } }
            }
        },
        '/api/orders/delivery-person/{deliveryPersonId}': {
            get: {
                tags: ['Orders'],
                summary: 'Get orders for delivery person',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'deliveryPersonId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Orders for delivery person' } }
            }
        },

        // ===== PAYMENT SERVICE (port 3004) =====
        '/api/payments': {
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
                responses: { '201': { description: 'Payment processed' } }
            }
        },
        '/api/payments/{orderId}': {
            get: {
                tags: ['Payments'],
                summary: 'Get payments by order ID',
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Payments for the order' } }
            }
        },
        '/api/payments/payment/{paymentId}': {
            get: {
                tags: ['Payments'],
                summary: 'Get payment by payment ID',
                parameters: [{ in: 'path', name: 'paymentId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Payment details' } }
            }
        },

        // ===== DELIVERY SERVICE (port 3005) =====
        '/api/deliveries': {
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
                responses: { '201': { description: 'Delivery created' } }
            },
            get: {
                tags: ['Deliveries'],
                summary: 'Get all deliveries (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: { '200': { description: 'All deliveries' } }
            }
        },
        '/api/deliveries/order/{orderId}': {
            get: {
                tags: ['Deliveries'],
                summary: 'Get delivery by order ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'orderId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Delivery for the order' } }
            }
        },
        '/api/deliveries/user/{userId}': {
            get: {
                tags: ['Deliveries'],
                summary: 'Get deliveries by user ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Deliveries for the user' } }
            }
        },
        '/api/deliveries/{id}': {
            get: {
                tags: ['Deliveries'],
                summary: 'Get delivery by ID',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: { '200': { description: 'Delivery details' } }
            }
        },
        '/api/deliveries/{id}/status': {
            put: {
                tags: ['Deliveries'],
                summary: 'Update delivery status',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
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
                responses: { '200': { description: 'Status updated' } }
            }
        },
        '/api/deliveries/{id}/assign': {
            put: {
                tags: ['Deliveries'],
                summary: 'Assign delivery person (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
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
                responses: { '200': { description: 'Delivery person assigned' } }
            }
        },
        '/api/deliveries/{id}/location': {
            put: {
                tags: ['Deliveries'],
                summary: 'Update delivery location',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
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
                responses: { '200': { description: 'Location updated' } }
            }
        }
    }
};

// Swagger UI for API Gateway
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Proxy each service at the correct /api/ prefix
app.use('/api/users', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/users$1' }
}));
app.use('/api/restaurants', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/restaurants$1' }
}));
app.use('/uploads', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/uploads$1' }
}));
app.use('/api/menu', createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/menu$1' }
}));
app.use('/api/orders', createProxyMiddleware({
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/orders$1' }
}));
app.use('/api/payments', createProxyMiddleware({
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/payments$1' }
}));
app.use('/api/deliveries', createProxyMiddleware({
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: { '^(.*)': '/deliveries$1' }
}));


// Enable json parsing for Gateway-specific default routes
app.use(express.json());

// Default route
app.get('/', (req, res) => {
    res.send('API Gateway is running. Use /api/... to access microservices. Visit /api-docs for Swagger UI.');
});

// Generic error handler
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Gateway Error' });
});

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
});
