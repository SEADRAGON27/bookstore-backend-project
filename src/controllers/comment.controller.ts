import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { CommentService } from '../services/comment.service';
import { NextFunction, Response } from 'express';
import { Log } from '../decorators/log.decorator';

export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Log({ body: true, user: true, params: true })
  async createComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const createCommentDto = req.body;
    const bookId = req.params.bookId;

    const comment = await this.commentService.createComment(userId, bookId, createCommentDto);

    res.status(200).json(comment);
  }

  @Log({ params: true, user: true })
  async addCommentToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    const comment = await this.commentService.addCommentToFavorites(userId, id);

    res.status(200).json(comment);
  }

  @Log({ params: true, user: true })
  async deleteCommentToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    const comment = await this.commentService.deleteCommentToFavorites(userId, id);

    res.status(200).json(comment);
  }

  @Log({ params: true, user: true })
  async updateComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;
    const updateCommentDTO = req.body;

    const comment = await this.commentService.updateComment(userId, id, updateCommentDTO);

    res.status(200).json(comment);
  }

  @Log({ params: true, user: true })
  async deleteComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    await this.commentService.deleteComment(userId, id);

    res.sendStatus(200);
  }

  @Log({ user: true })
  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;

    const query = req.query;

    const commentListWithCursor = await this.commentService.findAll(userId, query);

    res.status(200).json(commentListWithCursor);
  }

  @Log({ params: true, user: true })
  async addReplyToComment(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.identificator;
    const username = req.user.username;
    const bookId = req.params.bookId;
    const replyToCommentDto = req.body;

    const comment = await this.commentService.addReplyToComment(userId, username, bookId, id, replyToCommentDto);

    res.status(200).json(comment);
  }
}
