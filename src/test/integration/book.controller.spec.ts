import 'reflect-metadata';
import express, { Express } from 'express';
import request from 'supertest';
import { dataSource } from '../../configs/orm.config';
import bookRoute from '../../routes/book.route';
import { errorHandler } from '../../middlewares/errorHandler.middleware';
import { DataSource } from 'typeorm';
import { bookAttributes, booksLength31a, BooksOnTheMainPageEmptyArray, createUserAdminTest, createUserTest, exampleBook } from '../utils';
import { clientRedis } from '../../utils/clientRedis';
import { sign } from 'jsonwebtoken';
import path from 'path';
import { s3 } from '../../configs/s3.config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { authorRepository, bookRepository, categoryRepository, genreRepository, languageRepository, publisherRepository, userRepository } from '../../utils/initializeRepositories';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

describe('BookController', () => {
  let server: Express;
  let dataSourceTest: DataSource;
  let container: StartedPostgreSqlContainer;

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
    await languageRepository.save({ name: bookAttributes.language });
    await publisherRepository.save({ name: bookAttributes.publisher });
    await categoryRepository.save({ name: bookAttributes.category });
    await genreRepository.save({ name: bookAttributes.genre });
    await authorRepository.save({ fullName: bookAttributes.authors });
    dataSourceTest = dataSource;
  }, 300000);

  afterAll(async () => {
    await dataSourceTest.destroy();
    await clientRedis.quit();
    await container.stop();
  });

  beforeEach(async () => {
    await dataSourceTest.query('TRUNCATE TABLE books RESTART IDENTITY CASCADE;');
    await dataSourceTest.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
    await clientRedis.flushdb();
  });

  describe('GET / - Get books on the main page', () => {
    it('should return books for the main page when user is authenticated', async () => {
      const user = await userRepository.save(createUserTest);
      exampleBook.user = user;
      await bookRepository.save(exampleBook);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).get('/books/').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.salesBooks.length).toBeLessThan(10);
      expect(response.body.newBooks.length).toBeLessThan(10);
      expect(response.body.bestsellerBooks.length).toBeLessThan(10);
      expect(await clientRedis.get('/books/')).toBe(null);
    });

    it('should return the books one of them was liked by the user', async () => {
      const user = await userRepository.save(createUserAdminTest);
      exampleBook.user = user;
      const { id } = await bookRepository.save(exampleBook);

      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      await request(server).post(`/books/${id}/favorite`).set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const response = await request(server).get('/books/').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.newBooks[0].favorited).toBe(true);
      expect(response.body.bestsellerBooks[0].favorited).toBe(true);
      expect(await clientRedis.get('/books/')).toBe(null);
    });

    it('should return books for the main page when user is not authenticated', async () => {
      const user = await userRepository.save(createUserAdminTest);
      exampleBook.user = user;
      const { id } = await bookRepository.save(exampleBook);

      const response = await request(server).get('/books/').expect('Content-Type', /json/).expect(200);

      const books = await clientRedis.get('/books/');
      const booksOnTheMainPage = JSON.parse(books);

      expect(response.body.salesBooks.length).toBeLessThan(10);
      expect(response.body.newBooks.length).toBeLessThan(10);
      expect(response.body.bestsellerBooks.length).toBeLessThan(10);
      expect(booksOnTheMainPage.newBooks[0].book.id).toBe(id);
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
      const user = await userRepository.save(createUserAdminTest);
      exampleBook.user = user;
      await bookRepository.save(exampleBook);

      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).get('/books/category/Fiction').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const allFiction = response.body.books.every((item) => (item.book.category = 'Fiction'));

      expect(allFiction).toBe(true);
      expect(await clientRedis.get('/books/category/Fiction')).toBe(null);
    });

    it('should return book by category user is not authenticated', async () => {
      const user = await userRepository.save(createUserAdminTest);
      exampleBook.user = user;
      const { id } = await bookRepository.save(exampleBook);

      await request(server).get('/books/category/Fiction').expect('Content-Type', /json/).expect(200);

      const books = await clientRedis.get('/books/category/Fiction');
      const cacheRedisBookCategory = JSON.parse(books);

      expect(cacheRedisBookCategory[0].book.id).toBe(id);
    });

    it("should return empty array, if bookstore hasn't", async () => {
      const response = await request(server).get('/books/category/Fiction').expect('Content-Type', /json/).expect(200);

      expect(response.body.books.length).toBe(0);

      expect(await clientRedis.get('/books/category/Fiction')).toBe(null);
    });

    it('should return books with nexCursor 30', async () => {
      await bookRepository.save(booksLength31a);
      const response = await request(server).get('/books/category/Fiction').expect('Content-Type', /json/).expect(200);

      expect(response.body.books.length).toBe(30);
    });
  });

  describe('GET / - Get books according to your search request', () => {
    it("should return books's title according to your request", async () => {
      await bookRepository.save(booksLength31a);

      const response = await request(server).get('/books/search?text=example-book-title-11').expect('Content-Type', /json/).expect(200);

      expect(response.body.books[0].book.title).toBe('example-book-title-11');
    });

    it('looking for books using the keyword book. Should return all books', async () => {
      await bookRepository.save(booksLength31a);

      const response = await request(server).get('/books/search?text=book').expect('Content-Type', /json/).expect(200);

      expect(response.body.books.length).toBe(30);
    });
  });

  describe('GET / - get a book by title', () => {
    it('should return book', async () => {
      await bookRepository.save(booksLength31a);

      const response = await request(server).get('/books/example-book-title-11').expect('Content-Type', /json/).expect(200);

      expect(response.body.title).toBe('example-book-title-11');
    });

    it("book doesn't exist, should return error", async () => {
      const response = await request(server).get('/books/example-1').expect('Content-Type', /json/).expect(404);

      expect(response.body.message).toBe("Book doesn't exist");
    });
  });

  describe('POST / - add book to favorites and delete book from favorites', () => {
    it('should return the book with a like ', async () => {
      const user = await userRepository.save(createUserAdminTest);
      exampleBook.user = user;
      const { id } = await bookRepository.save(exampleBook);

      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).post(`/books/${id}/favorite`).set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.favoritesCount).toBe(1);
    });

    it('should return the book without a like', async () => {
      const user = await userRepository.save(createUserAdminTest);
      exampleBook.user = user;
      const { id } = await bookRepository.save(exampleBook);

      await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      await request(server).post(`/books/${id}/favorite`).set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const response = await request(server).post(`/books/${id}/unfavorite`).set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.favoritesCount).toBe(0);
    });
  });

  describe('POST / - create book', () => {
    it('should return book', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).post('/books/create').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(201);

      expect(response.body.title).toBe('example-book-title');
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

      exampleBook.user = user;
      const { id } = await bookRepository.save(exampleBook);

      exampleBook.summary = 'change summary';
      const response = await request(server).put(`/books/${id}`).set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(200);

      expect(response.body.summary).toBe('change summary');
    });

    it("should return error message, when book doesn't exist", async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });
      exampleBook.summary = 'change summary';

      const response = await request(server).put('/books/f95e70af-611b-46cb-9ce0-3115ed59940d').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(404);
      console.log(response.body);
      expect(response.body.message).toBe("Book doesn't exist.");
    });
  });

  describe('DELETE / - delete book', () => {
    it('should return delete message', async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });
      const filePath = path.join(__dirname, 'images', 'book-test-image.jpg');

      const responseLink = await request(server).post('/books/upload-image').set('Authorization', `Token ${jwt}`).attach('image', filePath).expect('Content-Type', /json/).expect(200);
      exampleBook.coverImageLink = responseLink.body;
      const responseBook = await request(server).post('/books/create').set('Authorization', `Token ${jwt}`).send(exampleBook).expect('Content-Type', /json/).expect(201);
      const response = await request(server).delete(`/books/${responseBook.body.id}`).set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body.message).toBe('Book has been deleted.');
    });

    it("should return error message, when book doesn't exist", async () => {
      await userRepository.save(createUserAdminTest);

      const jwt = sign(createUserAdminTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      const response = await request(server).delete('/books/f95e70af-611b-46cb-9ce0-3115ed59940d').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(404);

      expect(response.body.message).toBe("Book doesn't exist.");
    });
  });

  describe('GET / - get books liked by user', () => {
    it('should return books liked by user', async () => {
      const user = await userRepository.save(createUserTest);

      const jwt = sign(createUserTest, process.env.SECRET_PHRASE_ACCESS_TOKEN, { expiresIn: '30m' });

      exampleBook.user = user;

      const { id } = await bookRepository.save(exampleBook);

      await request(server).post(`/books/${id}/favorite`).set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);
      const response = await request(server).get('/books/liked/all').set('Authorization', `Token ${jwt}`).expect('Content-Type', /json/).expect(200);

      expect(response.body[0].favoritesCount).toBe(1);
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
