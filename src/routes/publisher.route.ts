import { Router } from 'express';
import { publisherRepository } from '../utils/initializeRepositories';
import { authMiddleware } from '../middlewares/auth.middleware';
import { chechRoleGuard } from '../guards/checkRole.guard';
import { PublisherController } from '../controllers/publisher.controller';
import { PublisherService } from '../services/publisher.service';
import { validation } from '../middlewares/validation.middleware';
import { BookAttributesDto } from '../dto/bookAttributes.dto';
import { winstonLoggerService } from '../logs/logger';

const router = Router();

const publisherService = new PublisherService(publisherRepository);
const publisherController = new PublisherController(publisherService, winstonLoggerService);

router.post('/create', authMiddleware, chechRoleGuard, validation(BookAttributesDto), publisherController.createPublisher.bind(publisherController));
router.delete('/:id', authMiddleware, chechRoleGuard, publisherController.deletePublisher.bind(publisherController));
router.put('/:id', authMiddleware, chechRoleGuard, validation(BookAttributesDto), publisherController.updatePublisher.bind(publisherController));
router.get('/:id', authMiddleware, chechRoleGuard, publisherController.getPublisher.bind(publisherController));
router.get('/all', publisherController.findAll.bind(publisherController));

export default router;
