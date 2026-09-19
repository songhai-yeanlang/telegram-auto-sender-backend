const express = require('express');
const cors = require('cors');
const env = require('./config/env.config');
const { connectDB } = require('./config/db.config');
const { initClient } = require('./features/telegram/telegram.service');
const logger = require('./utils/logger.util');
const errorHandler = require('./middlewares/errorHandler');

// រៀបចំ Routes
const contactRoutes = require('./features/contacts/contact.routes');
const broadcastRoutes = require('./features/broadcast/broadcast.routes');

const app = express();

app.use(cors());
app.use(express.json());

// ចុះឈ្មោះ Endpoints
app.use('/api/contacts', contactRoutes);
app.use('/api/broadcast', broadcastRoutes);

// ចាប់ Error
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