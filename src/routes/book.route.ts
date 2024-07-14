import { Router } from 'express';
import { BookService } from '../services/book.service';
import { BookController } from '../controllers/book.controller';
import { BookEntity } from '../entities/book.entity';
import { cache } from '../middlewares/cache.middleware';
import { clientRedis } from '../utils/clientRedis';
import { dataSource } from '../configs/orm.config';
import { UserEntity } from '../entities/user.entity';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authGuard } from '../guards/auth.guard';
import { upload } from '../middlewares/multer';
import { validation } from '../middlewares/validation.middleware';
import { createBookDto } from '../dto/createBook.dto';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { updateBookDto } from '../dto/updateBook.dto';

const router = Router();

const bookRepository = dataSource.getRepository(BookEntity);
const userRepository = dataSource.getRepository(UserEntity);
const bookService = new BookService(clientRedis, bookRepository, userRepository);
const bookController = new BookController(bookService);

router.get('/', authMiddleware, cache, bookController.getBooksOnTheMainPage.bind(bookController));
router.get('/category/:name', authMiddleware, cache, bookController.getBooksByCategory.bind(bookController));
router.post('/search', authMiddleware, cache, bookController.searchBook.bind(bookController));
router.get('/:title', authMiddleware, bookController.getBook.bind(bookController));
router.post('/create', authMiddleware, chechRoleGuard, validation(createBookDto), bookController.createBook.bind(bookController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(updateBookDto), bookController.updateBook.bind(bookController));
router.delete('/:id', authMiddleware, chechRoleGuard, bookController.deleteBook.bind(bookController));
router.get('/liked-books', authMiddleware, authGuard, bookController.getBooksLikedByUser.bind(bookController));
router.post('/upload-image', authMiddleware, chechRoleGuard, upload.single('image'), bookController.uploadImage.bind(bookController));
router.post('/delete-image', authMiddleware, chechRoleGuard, bookController.deleteImage.bind(bookController));
router.post('/:id/favorite', authMiddleware, authGuard, bookController.addBookToFavorites.bind(bookController));
router.post('/:id/unfavorite', authMiddleware, authGuard, bookController.deleteBookToFavorites.bind(bookController));

export default router;
