import 'dotenv/config';
import express from 'express';
import { connectDatabase } from '@config';
import { errorHandler, notFoundHandler } from '@middleware';
import routes from '@routes';

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