import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { WinstonLoggerService } from '../logs/logger';
import { CommentService } from '../services/comment.service';
import { NextFunction, Response } from 'express';
import { exceptionType } from '../utils/exceptionType';

export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const createCommentDto = req.body;
    const bookId = req.params.bookId;

    try {
      const comment = await this.commentService.createComment(userId, bookId, createCommentDto);

      res.status(200).json(comment);

      this.logger.log(`Creating a new comment successfully. User ID: ${userId}, Book ID: ${bookId}, Comment Data: ${JSON.stringify(createCommentDto)}`);
    } catch (error) {
      this.logger.error(`Error creating a new comment. User ID: ${userId}, Error: ${error.message}`);
      next(error);
    }
  }

  async addCommentToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    try {
      const comment = await this.commentService.addCommentToFavorites(userId, id);

      res.status(200).json(comment);

      this.logger.log(`Adding comment to favorites successfully. User ID: ${userId}, Comment ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error adding comment to favorites. User ID: ${userId}, Error: ${error.message}`);

      next(error);
    }
  }

  async deleteCommentToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    try {
      const comment = await this.commentService.deleteCommentToFavorites(userId, id);

      res.status(200).json(comment);

      this.logger.log(`Deleting comment from favorites successfully. User ID: ${userId}, Comment ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting comment from favorites. User ID: ${userId}, Error: ${error.message}`);

      next(error);
    }
  }

  async updateComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;
    const updateCommentDTO = req.body;

    try {
      const comment = await this.commentService.updateComment(userId, id, updateCommentDTO);

      res.status(200).json(comment);

      this.logger.log(`Updating comment successfully. User ID: ${userId}, Comment ID: ${id}, Updated Data: ${JSON.stringify(updateCommentDTO)}`);
    } catch (error) {
      this.logger.error(`Error updating comment. User ID: ${userId}, Comment ID: ${id}, Error: ${error.message}`);
      next(error);
    }
  }

  async deleteComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    try {
      await this.commentService.deleteComment(userId, id);

      res.sendStatus(200);

      this.logger.log(`Deleting comment successfully. User ID: ${userId}, Comment ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting comment. User ID: ${userId}, Comment ID: ${id}, Error: ${error.message}`);
      next(error);
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;

    try {
      const query = req.query;

      const commentListWithCursor = await this.commentService.findAll(userId, query);

      res.status(200).json(commentListWithCursor);

      this.logger.log(`Fetching all comments successfully. User ID: ${userId}, Query: ${JSON.stringify(query)}`);
    } catch (error) {
      this.logger.error(`Error fetching all comments. User ID: ${userId}, Error: ${error.message}`);
      next(error);
    }
  }

  async addReplyToComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.identificator;

    try {
      const username = req.user.username;
      const bookId = req.params.bookId;
      const replyToCommentDto = req.body;

      const comment = await this.commentService.addReplyToComment(userId, username, bookId, id, replyToCommentDto);

      res.status(200).json(comment);
      this.logger.log(`Adding reply to comment successfully. User ID: ${userId}, Username: ${username}, Book ID: ${bookId}, Comment ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error adding reply to comment. User ID: ${userId}, Comment ID: ${id}, Error: ${error.message}`);
      next(error);
    }
  }
}
