import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { UserEntity } from '../entities/user.entity';
import { CommentDto } from '../dto/comment.dto';
import { CustomError } from '../interfaces/customError';
import QueryString from 'qs';
import { BookEntity } from '../entities/book.entity';
import { NotificationService } from './notification.service';

export class CommentService {
  constructor(
    private readonly userRepository: Repository<UserEntity>,
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly bookRepository: Repository<BookEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async createComment(userId: string, id: string, createCommentDto: CommentDto): Promise<CommentEntity> {
    const book = await this.bookRepository.findOneBy({ id });

    if (!book) throw new CustomError(404, 'Book doesn`t exist.');

    const comment = new CommentEntity();
    Object.assign(comment, createCommentDto);

    comment.user = await this.userRepository.findOneBy({ id: userId });

    comment.book = book;

    return await this.commentRepository.save(comment);
  }

  async addCommentToFavorites(userId: string, id: string): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment) throw new CustomError(404, 'Coomment doesn`t exist.');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteComments'],
    });

    const isNotFavorited = user.favoriteComments.findIndex((commentInFavorites) => commentInFavorites.id === comment.id) === -1;

    if (isNotFavorited) {
      user.favoriteComments.push(comment);
      comment.favoritesCount++;

      await this.userRepository.manager.transaction(async (manager) => {
        await manager.save(user);
        await manager.save(comment);
      });
    }

    return comment;
  }

  async deleteCommentToFavorites(userId: string, id: string): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOneBy({ id });

    if (!comment) throw new CustomError(404, 'Coomment doesn`t exist.');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteComments'],
    });

    const commentIndex = user.favoriteComments.findIndex((commentInFavorites) => commentInFavorites.id === comment.id);

    if (commentIndex >= 0) {
      user.favoriteComments.splice(commentIndex, 1);
      comment.favoritesCount--;

      await this.userRepository.manager.transaction(async (manager) => {
        await manager.save(user);
        await manager.save(comment);
      });
    }

    return comment;
  }

  async updateComment(userId: string, id: string, updateCommentDTO: CommentDto): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new CustomError(404, "Comment doesn't exist.");

    if (comment.user.id !== userId) throw new CustomError(403, "You aren't authhor this comment.");

    Object.assign(comment, updateCommentDTO);

    return await this.commentRepository.save(comment);
  }

  async deleteComment(userId: string, id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new CustomError(404, "Comment doesn't exist.");

    if (comment.user.id !== userId && comment.user.role !== 'admin') throw new CustomError(403, "You aren't author this comment.");

    await this.commentRepository.delete({ id });
  }

  async findAll(userId: string, query: QueryString.ParsedQs) {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment').leftJoinAndSelect('comment.parentComment', 'parentComment');

    switch (query.rating) {
      case 'hight':
        queryBuilder.andWhere({ order: { favorites_count: 'DESC' } });
        break;
      case 'low':
        queryBuilder.andWhere({ order: { favorites_count: 'ASC' } });
        break;
    }

    let favoriteIds: string[] = [];

    if (userId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favoriteComments'],
      });

      favoriteIds = currentUser.favoriteComments.map((favorite) => favorite.id);
    }

    if (query.cursor) queryBuilder.andWhere('comment.id > :cursor', { cursor: query.cursor });

    const pageSize = 10;

    const comments = await queryBuilder
      .orderBy('comment.id', 'ASC')
      .take(pageSize + 1)
      .getMany();

    const parentCommentIds = new Set(comments.filter((comment) => comment.parentComment).map((comment) => comment.parentComment.id));

    const filteredComments = comments.filter((comment) => !parentCommentIds.has(comment.id));

    const commentsWithFavorited = filteredComments.map((comment) => {
      const favorited = favoriteIds.includes(comment.id);

      return { ...comment, favorited };
    });

    const hasNextPage = filteredComments.length > pageSize;

    if (hasNextPage) filteredComments.pop();

    const nextCursor = hasNextPage ? filteredComments[comments.length - 1].id : null;

    const commentListWithCursor = {
      comments: commentsWithFavorited,
      nextCursor: nextCursor,
    };

    return commentListWithCursor;
  }

  async addReplyToComment(userId: string, username: string, bookId: string, id: string, createCommentDto: CommentDto): Promise<CommentEntity> {
    const parentComment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!parentComment) throw new CustomError(404, "Comment doesn't exist.");

    let comment = await this.createComment(userId, bookId, createCommentDto);

    comment.parentComment = parentComment;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: parentComment.user.email,
      subject: `Answear on your comment from user:${username}`,
      text: `Click here to watch answear ${process.env.CLIENT_URL}books/${bookId}`,
    };

    comment = await this.commentRepository.save(comment);
    await this.notificationService.send(mailOptions);

    return comment;
  }
}
