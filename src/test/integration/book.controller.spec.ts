import 'dotenv/config';
import 'reflect-metadata';
import express, { Express } from 'express';
import request from 'supertest';
import { dataSource } from '../../configs/orm.config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bookRoute from '../../routes/book.route';
import userRoute from '../../routes/user.route';
import commentRoute from '../../routes/comment.route';
import orderRoute from '../../routes/order.route';
import promoCodeRoute from '../../routes/promoCode.route';
import { errorHandler } from '../../middlewares/errorHandler.middleware';
import fingerprint from 'express-fingerprint';
import { DataSource } from 'typeorm';
import { books, booksLength31a, booksOnTheMainPage, BooksOnTheMainPageEmptyArray, cacheRedisBookCategory, createUserAdminTest, createUserTest, exampleBook } from '../utils';
import { clientRedis } from '../../utils/clientRedis';
import { sign } from 'jsonwebtoken';
import path from 'path';
import { s3 } from '../../configs/s3.config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { bookRepository, userRepository } from '../../utils/initializeRepositories';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('BookController', () => {
  let server: Express;
  let dataSourceTest: DataSource;
  let container: StartedPostgreSqlContainer;

  beforeEach(async () => {
    await dataSourceTest.query('TRUNCATE TABLE books RESTART IDENTITY CASCADE;');
    await dataSourceTest.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
    await clientRedis.flushdb();
  });

  beforeAll(async () => {
    const app = express();
    
    app.use(express.json());

    app.use('/books', bookRoute);

    app.use(errorHandler);

    server = app;
    container = await new PostgreSqlContainer().withExposedPorts(5432).start();
    
    dataSource.setOptions({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getPassword(),
      schema: 'public',
    });

    await dataSource.initialize();
    dataSourceTest = dataSource;
  }, 200000);

  afterAll(async () => {
    await dataSourceTest.destroy();
    await clientRedis.quit();
    await container.stop();
  });

  describe('GET / - Get books on the main page', () => {
    it('should return books for the main page when user is authenticated', async () => {
      await bookRepository.save(books);

      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).get('/books/').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.salesBooks.length).toBeLessThan(10);
      expect(response.body.newBooks.length).toBeLessThan(10);
      expect(response.body.bestsellerBooks.length).toBeLessThan(10);
      expect(await clientRedis.get('/books/')).toBe(null);
    });

    it('should return the books one of them was liked by the user', async () => {
      await bookRepository.save(books);

      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      await request(server).post('/books/1/favorite').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const response = await request(server).get('/books/').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.newBooks[1].favorited).toBe(true);
      expect(response.body.bestsellerBooks[0].favorited).toBe(true);
      expect(await clientRedis.get('/books/')).toBe(null);
    });

    it('should return books for the main page when user is not authenticated', async () => {
      delete books[0].user;
      await bookRepository.save(books);

      const response = await request(server).get('/books/').expect('Content-Type', /json/).expect(200);

      expect(response.body.salesBooks.length).toBeLessThan(10);
      expect(response.body.newBooks.length).toBeLessThan(10);
      expect(response.body.bestsellerBooks.length).toBeLessThan(10);
      expect(await clientRedis.get('/books/')).toBe(JSON.stringify(booksOnTheMainPage));
    });

    it("should return empty array, if bookstore hasn't", async () => {
      const response = await request(server).get('/books/').expect('Content-Type', /json/).expect(200);

      expect(response.body.salesBooks.length).toBe(0);
      expect(response.body.newBooks.length).toBe(0);
      expect(response.body.bestsellerBooks.length).toBe(0);
      expect(await clientRedis.get('/books/')).toBe(JSON.stringify(BooksOnTheMainPageEmptyArray));
    });
  });

  describe('GET / - Get books by category', () => {
    it('should return book by category user is authenticated', async () => {
      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      books[0].category = 'journalist';
      await bookRepository.save(books);

      const response = await request(server).get('/books/category/journalist').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const allJournalist = response.body.books.every((item) => (item.book.category = 'journalist'));

      expect(allJournalist).toBe(true);
      expect(await clientRedis.get('/books/category/journalist')).toBe(null);
    });

    it('should return book by category user is not authenticated', async () => {
      delete books[0].user;

      books[0].category = 'journalist';
      await bookRepository.save(books);

      await request(server).get('/books/category/journalist').expect('Content-Type', /json/).expect(200);

      expect(await clientRedis.get('/books/category/journalist')).toBe(JSON.stringify(cacheRedisBookCategory));
    });

    it("should return empty array, if bookstore hasn't", async () => {
      const response = await request(server).get('/books/category/journalist').expect('Content-Type', /json/).expect(200);

      expect(response.body.books.length).toBe(0);

      expect(await clientRedis.get('/books/category/journalist')).toBe(null);
    });

    it('should return books with nexCursor 30', async () => {
      await bookRepository.save(booksLength31a);

      const response = await request(server).get('/books/category/fiction').expect('Content-Type', /json/).expect(200);

      expect(response.body.nextCursor).toBe(30);
    });
  });

  describe('GET / - Get books according to your search request', () => {
    it("should return books's title according to your request", async () => {
      await bookRepository.save(booksLength31a);

      const response = await request(server).get('/books/search?text=example-book-title-1').expect('Content-Type', /json/).expect(200);

      expect(response.body.books[0].book.title).toBe('example-book-title-1');
    });

    it('looking for books using the keyword book. Should return all books', async () => {
      await bookRepository.save(booksLength31a);

      const response = await request(server).get('/books/search?text=book').expect('Content-Type', /json/).expect(200);

      expect(response.body.books.length).toBe(30);
    });
  });

  describe('GET / - get a book by title', () => {
    it('should return book', async () => {
      await bookRepository.save(books);

      const response = await request(server).get('/books/example-1').expect('Content-Type', /json/).expect(200);

      expect(response.body.title).toBe('example-1');
    });

    it("book doesn't exist, should return error", async () => {
      const response = await request(server).get('/books/example-1').expect('Content-Type', /json/).expect(404);

      expect(response.body.message).toBe("Book doesn't exist");
    });
  });

  describe('POST / - add book to favorites and delete book from favorites', () => {
    it('should return the book with a like ', async () => {
      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      await bookRepository.save(books);

      const response = await request(server).post('/books/1/favorite').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.favorites_count).toBe(1);
    });

    it('should return the book without a like', async () => {
      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      await bookRepository.save(books);

      await request(server).post('/books/1/favorite').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const response = await request(server).post('/books/1/unfavorite').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.favorites_count).toBe(0);
    });
  });

  describe('POST / - create book', () => {
    it('should return book', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).post('/books/create').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(201);

      expect(response.body.id).toBe(1);
    });

    it('should return error message, when book title already exists', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });
      await bookRepository.save(exampleBook);

      const response = await request(server).post('/books/create').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(403);

      expect(response.body.message).toBe('Book title already exists, please select another one');
    });
  });

  describe('PUT / - update book', () => {
    it('should return book', async () => {
      const user = await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      books[0].user = user;
      await bookRepository.save(books[0]);

      exampleBook.summary = 'change summary';
      const response = await request(server).put('/books/1').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(200);

      expect(response.body.summary).toBe('change summary');
    });

    it("should return error message, when book doesn't exist", async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });
      exampleBook.summary = 'change summary';

      const response = await request(server).put('/books/1').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(404);

      expect(response.body.message).toBe("Book doesn't exist.");
    });
  });

  describe('DELETE / - delete book', () => {
    it('should return delete message', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });
      const filePath = path.join(__dirname, 'images', 'book-test-image.jpg');

      const responseLink = await request(server).post('/books/upload-image').set('Authorization', `Token ${jwt}`).attach('image', filePath).expect('Content-Type', /json/).expect(200);
      exampleBook.cover_image_link = responseLink.body;
      await request(server).post('/books/create').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(201);
      const response = await request(server).delete('/books/1').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.message).toBe('Book has been deleted.');
    });

    it("should return error message, when book doesn't exist", async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).delete('/books/1').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(404);

      expect(response.body.message).toBe("Book doesn't exist.");
    });
  });

  describe('GET / - get books liked by user', () => {
    it('should return books liked by user', async () => {
      const user = await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      books[0].user = user;
      books[1].user = user;

      await bookRepository.save(books);

      await request(server).post('/books/2/favorite').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const response = await request(server).get('/books/liked/all').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body[0].favorites_count).toBe(1);
    });

    it('should return empty array', async () => {
      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).get('/books/liked/all').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.length).toBe(0);
    });
  });

  describe('POST / - upload image', () => {
    it('should return link to file', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });
      const filePath = path.join(__dirname, 'images', 'book-test-image.jpg');

      const response = await request(server).post('/books/upload-image').set('Authorization', `Token ${jwt}`).attach('image', filePath).expect('Content-Type', /json/).expect(200);

      expect(response.body).toBe(`https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/book-test-image.jpg`);

      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME!, Key: 'book-test-image.jpg' }));
    });
  });

  describe('POST / - delete image', () => {
    it('should return succesfull message', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const filePath = path.join(__dirname, 'images', 'book-test-image.jpg');

      const responseLink = await request(server).post('/books/upload-image').set('Authorization', `Token ${jwt}`).attach('image', filePath).expect('Content-Type', /json/).expect(200);
      const response = await request(server).post('/books/delete-image').set('Authorization', `Token ${jwt}`).send({ imageLink: responseLink.body }).expect('Content-Type', /json/).expect(200);

      expect(response.body.message).toBe('Image has been deleted.');
    });
  });
});
