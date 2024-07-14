import { Router } from 'express';
import { dataSource } from '../configs/orm.config';
import { CommentEntity } from '../entities/comment.entity';
import { CommentService } from '../services/comment.service';
import { CommentController } from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authGuard } from '../guards/auth.guard';
import { CommentDto } from '../dto/comment.dto';
import { validation } from '../middlewares/validation.middleware';
import { UserEntity } from '../entities/user.entity';
import { BookEntity } from '../entities/book.entity';

const router = Router();

const commentRepository = dataSource.getRepository(CommentEntity);
const userRepository = dataSource.getRepository(UserEntity);
const bookRepository = dataSource.getRepository(BookEntity);
const commentService = new CommentService(userRepository, commentRepository, bookRepository);
const commentController = new CommentController(commentService);

router.post('/create/:bookId', authMiddleware, authGuard, validation(CommentDto), commentController.createComment.bind(commentController));
router.post('/:id/favorite', authMiddleware, authGuard, commentController.addCommentToFavorites.bind(commentController));
router.post('/:id/unfavorite', authMiddleware, authGuard, commentController.deleteCommentToFavorites.bind(commentController));
router.put('/:id', authMiddleware, authGuard, validation(CommentDto), commentController.updateComment.bind(commentController));
router.delete('/:id', authMiddleware, authGuard, commentController.deleteComment.bind(commentController));
router.post('/:id/add-reply/:bookId', authMiddleware, authGuard, validation(CommentDto), commentController.addReplyToComment.bind(commentController));
router.get('/all', authMiddleware, commentController.findAll.bind(commentController));

export default router;
