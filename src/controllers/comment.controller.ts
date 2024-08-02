import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { logger } from '../logs/logger';
import { CommentService } from '../services/comment.service';
import { NextFunction, Response } from 'express';

export class CommentController {
  constructor(private commentService: CommentService) {}

  async createComment(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const createCommentDto = req.body;
      const bookId = req.params.bookId as unknown as number;

      const comment = await this.commentService.createComment(userId, bookId, createCommentDto);

      res.status(200).json(comment);
      logger.info({ userId, bookId, createCommentDto }, 'Creating a new comment successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error creating a new comment');
      next(error);
    
    }
  }

  async addCommentToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;

      const comment = await this.commentService.addCommentToFavorites(userId, id);

      res.status(200).json(comment);
      logger.info({ userId, id }, 'Adding comment to favorites succesfully');
    
    } catch (error) {
      
      logger.error(error, 'Error adding comment to favorites');
      next(error);
    
    }
  }

  async deleteCommentToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;

      const comment = await this.commentService.deleteCommentToFavorites(userId, id);

      res.status(200).json(comment);
      logger.info({ userId, id }, 'Deleting comment from favorites successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting comment from favorites');
      next(error);
    
    }
  }

  async updateComment(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;
      const updateCommentDTO = req.body;

      const comment = await this.commentService.updateComment(userId, id, updateCommentDTO);

      res.status(200).json(comment);
      logger.info({ userId, id, updateCommentDTO }, 'Updating comment successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating comment');
      next(error);
    
    }
  }

  async deleteComment(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;

      await this.commentService.deleteComment(userId, id);

      res.sendStatus(200);
      logger.info({ userId, id }, 'Deleting comment successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting comment');
      next(error);
    
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.id : null;
      const query = req.query;

      const commentListWithCursor = await this.commentService.findAll(userId, query);

      res.status(200).json(commentListWithCursor);
      logger.info({ userId, query }, 'Fetching all comments successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error fetching all comments');
      next(error);
    
    }
  }

  async addReplyToComment(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const username = req.user.username;
      const userId = req.user.id;
      const id = req.params.identificator as unknown as number;
      const bookId = req.params.bookId as unknown as number;
      const replyToCommentDto = req.body;

      const comment = await this.commentService.addReplyToComment(userId, username, bookId, id, replyToCommentDto);

      res.status(200).json(comment);
      logger.info({ userId, username, bookId, id, replyToCommentDto }, 'Adding reply to comment successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error adding reply to comment');
      next(error);
    
    }
  }
}
