import { Router } from 'express';
import { categoryRepository } from '../utils/initializeRepositories';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { CategoryService } from '../services/category.service';
import { CategoryController } from '../controllers/category.controller';
import { BookAttributesDto } from '../dto/bookAttributes.dto';
import { validation } from '../middlewares/validation.middleware';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService, winstonLoggerService);

router.post('/create', authMiddleware, chechRoleGuard, validation(BookAttributesDto), categoryController.createCategory.bind(categoryController));
router.delete('/:id', authMiddleware, chechRoleGuard, categoryController.deleteCategory.bind(categoryController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(BookAttributesDto), categoryController.updateCategory.bind(categoryController));
router.get('/:id', authMiddleware, chechRoleGuard, categoryController.getCategory.bind(categoryController));
router.get('/all', authMiddleware, chechRoleGuard, categoryController.findAll.bind(categoryController));

export default router;
