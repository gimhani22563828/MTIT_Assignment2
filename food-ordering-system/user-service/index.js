const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Swagger setup
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'User Service API',
        version: '1.0.0',
        description: 'Microservice for user registration, login, and profile management'
    },
    servers: [
        { url: 'http://localhost:3001', description: 'Direct User Service' }
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
        '/users/register': {
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
        '/users/login': {
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
        '/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user profile by ID',
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }],
                responses: {
                    '200': { description: 'User profile returned successfully' },
                    '404': { description: 'User not found' }
                }
            }
        },
        '/users/delivery-persons': {
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
        '/users/delivery-persons/available': {
            get: {
                tags: ['Delivery Persons'],
                summary: 'Get available delivery persons (Admin only)',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': { description: 'List of available delivery persons' },
                    '403': { description: 'Only admins can view delivery persons' }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Make sure to match the API Gateway rewrite path if not handled correctly.
// The Gateway rewrites /api/users to /users
app.use('/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (User DB)');
        app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
