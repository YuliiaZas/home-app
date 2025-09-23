import 'dotenv/config';
import express from 'express';
import connectDatabase from './config/database';
import { errorHandler, notFoundHandler } from './middleware/index';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDatabase();

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});