import { Router } from 'express';
import { genreRepository } from '../utils/initializeRepositories';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { GenreService } from '../services/genre.service';
import { GenreController } from '../controllers/genre.controller';
import { BookAttributesDto } from '../dto/bookAttributes.dto';
import { validation } from '../middlewares/validation.middleware';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const genreService = new GenreService(genreRepository);
const genreController = new GenreController(genreService, winstonLoggerService);

router.post('/create', authMiddleware, chechRoleGuard, validation(BookAttributesDto), genreController.createGenre.bind(genreController));
router.delete('/:id', authMiddleware, chechRoleGuard, genreController.deleteGenre.bind(genreController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(BookAttributesDto), genreController.updateGenre.bind(genreController));
router.get('/:id', authMiddleware, chechRoleGuard, genreController.getGenre.bind(genreController));
router.get('/all', authMiddleware, chechRoleGuard, genreController.findAll.bind(genreController));

export default router;
