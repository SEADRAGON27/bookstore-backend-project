import { Router } from 'express';
import { languageRepository } from '../utils/initializeRepositories';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { LanguageController } from '../controllers/language.controller';
import { BookAttributesDto } from '../dto/bookAttributes.dto';
import { validation } from '../middlewares/validation.middleware';
import { LanguageService } from '../services/language.service';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const languageService = new LanguageService(languageRepository);
const languageController = new LanguageController(languageService, winstonLoggerService);

router.post('/create', authMiddleware, chechRoleGuard, validation(BookAttributesDto), languageController.createLanguage.bind(languageController));
router.delete('/:id', authMiddleware, chechRoleGuard, languageController.deleteLanguage.bind(languageController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(BookAttributesDto), languageController.updateLanguage.bind(languageController));
router.get('/:id', authMiddleware, chechRoleGuard, languageController.getLanguages.bind(languageController));
router.get('/all', authMiddleware, chechRoleGuard, languageController.findAll.bind(languageController));

export default router;
