import 'dotenv/config';
import 'reflect-metadata';
import './utils/cronJob';
import express, { Express } from 'express';
import { logger } from './logs/logger';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { dataSource } from './configs/orm.config';
import cookieParser from 'cookie-parser';
import fingerprint from 'express-fingerprint';
import helmet from 'helmet';
import userRoute from './routes/user.route';
import bookRoute from './routes/book.route';
import commentRoute from './routes/comment.route';
import orderRoute from './routes/order.route';
import promoCodeRoute from './routes/order.route';

const app: Express = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(fingerprint());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use('/books', bookRoute);
app.use('/users', userRoute);
app.use('/comments', commentRoute);
app.use('/orders', orderRoute);
app.use('/promoCodes', promoCodeRoute);

app.use(errorHandler);

dataSource
  .initialize()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server started on port 8000');
    });

    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
