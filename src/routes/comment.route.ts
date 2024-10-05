import { Router } from 'express';
import { CommentService } from '../services/comment.service';
import { CommentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authGuard } from '../guards/auth.guard';
import { CommentDto } from '../dto/comment.dto';
import { validation } from '../middlewares/validation.middleware';
import { bookRepository, commentRepository, userRepository } from '../utils/initializeRepositories';
import { winstonLoggerService } from '../logs/logger';
import { notificationService } from '../services/notification.service';

const router = Router();

const commentService = new CommentService(userRepository, commentRepository, bookRepository, notificationService);
const commentController = new CommentController(commentService, winstonLoggerService);

router.post('/create/:bookId', authMiddleware, authGuard, validation(CommentDto), commentController.createComment.bind(commentController));
router.post('/:id/favorite', authMiddleware, authGuard, commentController.addCommentToFavorites.bind(commentController));
router.post('/:id/unfavorite', authMiddleware, authGuard, commentController.deleteCommentToFavorites.bind(commentController));
router.put('/:id', authMiddleware, authGuard, validation(CommentDto), commentController.updateComment.bind(commentController));
router.delete('/:id', authMiddleware, authGuard, commentController.deleteComment.bind(commentController));
router.post('/:id/add-reply/:bookId', authMiddleware, authGuard, validation(CommentDto), commentController.addReplyToComment.bind(commentController));
router.get('/all', authMiddleware, commentController.findAll.bind(commentController));

export default router;
