const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Restaurant & Menu Service API',
        version: '1.0.0',
        description: 'Microservice for restaurant and menu item management'
    },
    servers: [
        { url: 'http://localhost:3002', description: 'Direct Restaurant Service' }
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
        '/restaurants': {
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
                    '201': { description: 'Restaurant created successfully' },
                    '400': { description: 'Name and address are required' }
                }
            },
            get: {
                tags: ['Restaurants'],
                summary: 'Get all restaurants',
                responses: {
                    '200': { description: 'List of all restaurants' }
                }
            }
        },
        '/restaurants/{id}': {
            put: {
                tags: ['Restaurants'],
                summary: 'Update a restaurant (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Restaurant ID' }],
                requestBody: {
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    address: { type: 'string' },
                                    cuisineType: { type: 'string' },
                                    lat: { type: 'number' },
                                    lng: { type: 'number' },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Restaurant updated successfully' }
                }
            },
            delete: {
                tags: ['Restaurants'],
                summary: 'Delete a restaurant (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Restaurant ID' }],
                responses: {
                    '200': { description: 'Restaurant deleted' }
                }
            }
        },
        '/restaurants/{id}/rate': {
            post: {
                tags: ['Restaurants'],
                summary: 'Rate a restaurant',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Restaurant ID' }],
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
                responses: {
                    '200': { description: 'Rating saved successfully' },
                    '400': { description: 'Valid userId and score (1-5) are required' }
                }
            }
        },
        '/menu': {
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
                                    restaurantId: { type: 'string', example: '6651234567890abcdef12346' },
                                    name: { type: 'string', example: 'Margherita Pizza' },
                                    description: { type: 'string', example: 'Classic cheese pizza' },
                                    price: { type: 'number', example: 1200 },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '201': { description: 'Menu item created' },
                    '400': { description: 'RestaurantId, name and price are required' }
                }
            },
            get: {
                tags: ['Menu'],
                summary: 'Get all menu items',
                responses: {
                    '200': { description: 'List of all menu items' }
                }
            }
        },
        '/menu/{restaurantId}': {
            get: {
                tags: ['Menu'],
                summary: 'Get menu items by restaurant',
                parameters: [{ in: 'path', name: 'restaurantId', required: true, schema: { type: 'string' }, description: 'Restaurant ID' }],
                responses: {
                    '200': { description: 'Menu items for the restaurant' }
                }
            }
        },
        '/menu/{id}': {
            put: {
                tags: ['Menu'],
                summary: 'Update a menu item (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Menu Item ID' }],
                requestBody: {
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    price: { type: 'number' },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Menu item updated' }
                }
            },
            delete: {
                tags: ['Menu'],
                summary: 'Delete a menu item (Admin only)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Menu Item ID' }],
                responses: {
                    '200': { description: 'Menu item deleted' }
                }
            }
        },
        '/menu/{id}/rate': {
            post: {
                tags: ['Menu'],
                summary: 'Rate a menu item',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'Menu Item ID' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userId', 'score'],
                                properties: {
                                    userId: { type: 'string', example: '6651234567890abcdef12345' },
                                    score: { type: 'number', minimum: 1, maximum: 5, example: 5 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Rating saved successfully' },
                    '400': { description: 'Valid userId and score (1-5) are required' }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/uploads', express.static('uploads'));
app.use('/restaurants', restaurantRoutes);
app.use('/menu', menuRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3002;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Restaurant DB)');
        app.listen(PORT, () => console.log(`Restaurant Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
