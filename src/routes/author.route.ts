import { Router } from 'express';
import { AuthorService } from '../services/author.service';
import { authorRepository } from '../utils/initializeRepositories';
import { AuthorController } from '../controllers/author.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { validation } from '../middlewares/validation.middleware';
import { AuthorDto } from '../dto/author.dto';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const authorService = new AuthorService(authorRepository);
const authorController = new AuthorController(authorService, winstonLoggerService);

router.post('/create', authMiddleware, chechRoleGuard, validation(AuthorDto), authorController.createAuthor.bind(authorController));
router.delete('/:id', authMiddleware, chechRoleGuard, authorController.deleteAuthor.bind(authorController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(AuthorDto), authorController.updateAuthor.bind(authorController));
router.get('/:id', authMiddleware, chechRoleGuard, authorController.getAuthor.bind(authorController));
router.get('/all/a', authorController.findAll.bind(authorController));

export default router;
