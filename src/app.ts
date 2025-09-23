import express from 'express';
import { json } from 'body-parser';
import { setRoutes } from './routes/index';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/index';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// Database connection
connectDatabase();

// Routes
setRoutes(app);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});