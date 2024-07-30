import { Router } from 'express';
import { BookService } from '../services/book.service';
import { BookController } from '../controllers/book.controller';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { clientRedis } from '../utils/clientRedis';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authGuard } from '../guards/auth.guard';
import { upload } from '../middlewares/multer';
import { validation } from '../middlewares/validation.middleware';
import { BookDto } from '../dto/book.dto';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { bookRepository, userRepository } from '../utils/initializeRepositories';

const router = Router();

const bookService = new BookService(clientRedis, bookRepository, userRepository);
const bookController = new BookController(bookService);

router.get('/', authMiddleware, cacheMiddleware, bookController.getBooksOnTheMainPage.bind(bookController));
router.get('/category/:name', authMiddleware, cacheMiddleware, bookController.getBooksByCategory.bind(bookController));
router.get('/search', authMiddleware, cacheMiddleware, bookController.searchBook.bind(bookController));
router.get('/:title', authMiddleware, bookController.getBook.bind(bookController));
router.post('/create', authMiddleware, chechRoleGuard, validation(BookDto), bookController.createBook.bind(bookController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(BookDto), bookController.updateBook.bind(bookController));
router.delete('/:id', authMiddleware, chechRoleGuard, bookController.deleteBook.bind(bookController));
router.get('/liked/all', authMiddleware, authGuard, bookController.getBooksLikedByUser.bind(bookController));
router.post('/upload-image', authMiddleware, chechRoleGuard, upload.single('image'), bookController.uploadImage.bind(bookController));
router.post('/delete-image', authMiddleware, chechRoleGuard, bookController.deleteImage.bind(bookController));
router.post('/:id/favorite', authMiddleware, authGuard, bookController.addBookToFavorites.bind(bookController));
router.post('/:id/unfavorite', authMiddleware, authGuard, bookController.deleteBookToFavorites.bind(bookController));

export default router;
