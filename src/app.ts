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
import promoCodeRoute from './routes/promoCode.route';
import authorRoute from './routes/author.route';
import categoryRoute from './routes/category.route';
import genreRoute from './routes/genre.route';
import publisherRoute from './routes/publisher.route';
import languageRoute from './routes/language.route';

import cors from 'cors';
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
  }),
);

app.use('/books', bookRoute);
app.use('/users', userRoute);
app.use('/comments', commentRoute);
app.use('/orders', orderRoute);
app.use('/promo-codes', promoCodeRoute);
app.use('/authors', authorRoute);
app.use('/categories', categoryRoute);
app.use('/languages', languageRoute);
app.use('/genres', genreRoute);
app.use('/publishers', publisherRoute);

app.use(errorHandler);

dataSource
  .initialize()
  .then(() => {
    logger.info('Data Source has been initialized!');
    app.listen(3000, () => {
      logger.info('Server started on port 8000');
    });
  })
  .catch((err) => {
    console.log(err);
    logger.fatal(`Error during Data Source initialization:${err}`);
  });
