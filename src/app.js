const express = require('express');
const cors = require('cors');
const env = require('./config/env.config');
const { connectDB } = require('./config/db.config');
const { initClient } = require('./features/telegram/telegram.service');
const path = require('path');
const logger = require('./utils/logger.util');
const errorHandler = require('./middlewares/errorHandler');

// Setup Routes
const contactRoutes = require('./features/contacts/contact.routes');
const broadcastRoutes = require('./features/broadcast/broadcast.routes');
const authRoutes = require('./features/auth/auth.route');

const app = express();

app.use(cors());
app.use(express.json());

// Serve static uploaded files (e.g. avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// Register Endpoints
app.use('/api/contacts', contactRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/auth', authRoutes);

// Catch Errors
app.use(errorHandler);

const startServer = async () => {
    try {
        await connectDB();
        await initClient();

        app.listen(env.port, () => {
            logger.info(`http://localhost:${env.port}`);
        });
    } catch (error) {
        logger.error(" fail Server:", error);
        process.exit(1);
    }
};

startServer();