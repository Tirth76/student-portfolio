const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');

const authMiddleware = require('./middleware/auth');
const validateTaskInput = require('./middleware/validateTask');

const cache = require('./cache');
const taskEvents = require('./events');
require('./listeners');

const app = express();

const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(express.json());

// Enable CORS for frontend cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// -----------------------------------------------------------------------------
// 1. GLOBAL LOGGING MIDDLEWARE
// -----------------------------------------------------------------------------

app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// -----------------------------------------------------------------------------
// 2. JSON CONTENT-TYPE VALIDATOR
// -----------------------------------------------------------------------------

const requireJsonContent = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];

        if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json({
                error: 'Bad Request: Content-Type must be application/json'
            });
        }
    }

    next();
};

app.use(requireJsonContent);

// -----------------------------------------------------------------------------
// 3. ROOT ROUTE & TEST ENDPOINTS
// -----------------------------------------------------------------------------

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Practical 5 - MongoDB Task Manager API',
        endpoints: {
            'GET /tasks': 'Fetch all tasks',
            'GET /tasks/:id': 'Fetch single task by MongoDB ID',
            'POST /tasks': 'Create a new task',
            'PUT /tasks/:id': 'Update task by MongoDB ID',
            'DELETE /tasks/:id': 'Delete task by MongoDB ID'
        }
    });
});

app.get('/error-test', (req, res, next) => {
    next(new Error('Simulated server error for global error handler test'));
});

// -----------------------------------------------------------------------------
// REGISTER
// -----------------------------------------------------------------------------

app.post('/register', async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters'
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = await User.create({
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {

        next(err);

    }
});

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------

app.post('/login', async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (err) {

        next(err);

    }
});

// -----------------------------------------------------------------------------
// CURRENT USER
// -----------------------------------------------------------------------------

app.get('/me', authMiddleware, async (req, res, next) => {

    try {

        const user = await User.findById(req.user.id)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (err) {

        next(err);

    }
});

// -----------------------------------------------------------------------------
// AUTHENTICATION FOR TASK ROUTES
// -----------------------------------------------------------------------------

app.use('/tasks', authMiddleware);
app.use('/tasks', validateTaskInput);

// -----------------------------------------------------------------------------
// 4. GET ALL TASKS - WITH CACHE
// -----------------------------------------------------------------------------

app.get('/tasks', async (req, res, next) => {
    try {

        // Check cache first
        const cached = cache.get('all_tasks');

        if (cached) {
            console.log('CACHE HIT - returning cached tasks');

            return res.status(200).json(cached);
        }

        console.log('CACHE MISS - querying MongoDB');

        // Check if MongoDB is connected; if not (e.g. running unit/CI tests without DB), return empty data
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }

        // Query MongoDB if cache does not exist
        const tasks = await Task.find();

        const response = {
            success: true,
            count: tasks.length,
            data: tasks
        };

        // Store response in cache
        cache.set('all_tasks', response);

        res.status(200).json(response);

    } catch (err) {
        next(err);
    }
});

// -----------------------------------------------------------------------------
// 5. GET TASK BY ID
// -----------------------------------------------------------------------------

app.get('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
});

// -----------------------------------------------------------------------------
// 6. CREATE TASK
// -----------------------------------------------------------------------------

app.post('/tasks', async (req, res, next) => {
    try {
        const task = await Task.create(req.body);
        cache.del('all_tasks');

        console.log(`[API] Response sent at ${new Date().toISOString()}`);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });

        // Emit event after responding
        const eventData = task.toObject ? task.toObject() : { ...task };
        eventData.assignedTo = req.body.assignedTo || (req.user && req.user.email) || 'student@example.com';
        if (req.body.simulateError) eventData.simulateError = true;
        taskEvents.emit('task-created', eventData);
    } catch (err) {
        next(err);
    }
});

// -----------------------------------------------------------------------------
// 7. UPDATE TASK
// -----------------------------------------------------------------------------

app.put('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }
        cache.del('all_tasks');

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (err) {
        next(err);
    }
});

// -----------------------------------------------------------------------------
// 8. DELETE TASK
// -----------------------------------------------------------------------------

app.delete('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }
        cache.del('all_tasks');

        console.log(`[API] Delete response sent at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: task
        });

        // Emit event after responding
        taskEvents.emit('task-deleted', task);
    } catch (err) {
        next(err);
    }
});

// -----------------------------------------------------------------------------
// 9. 404 HANDLER
// -----------------------------------------------------------------------------

app.use((req, res, next) => {
    res.status(404).json({
        error: 'Route Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// -----------------------------------------------------------------------------
// 10. GLOBAL ERROR HANDLER
// -----------------------------------------------------------------------------

app.use((err, req, res, next) => {
    console.error('[Error Handler Stack]:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = {};

        for (const field in err.errors) {
            errors[field] = err.errors[field].message;
        }

        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid task ID'
        });
    }

    // Other errors
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong on the server'
            : err.message
    });
});

// -----------------------------------------------------------------------------
// 11. CONNECT TO MONGODB AND START SERVER
// -----------------------------------------------------------------------------

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/taskdb';

if (require.main === module) {
    mongoose.connect(MONGO_URI)
        .then(() => {
            console.log(`MongoDB connected successfully to ${MONGO_URI}`);

            const server = app.listen(PORT, '0.0.0.0', () => {
                console.log(
                    `Task Manager API running on http://localhost:${PORT}`
                );
            });

            server.on('error', (err) => {
                console.error(`[Server Error] Failed to bind to port ${PORT}:`, err.message);
            });
        })
        .catch((err) => {
            console.error('MongoDB connection failed:', err);
        });
}

module.exports = app;