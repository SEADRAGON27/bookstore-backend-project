import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { UserEntity } from '../entities/user.entity';
import { CommentDto } from '../dto/comment.dto';
import { CustomError } from '../interfaces/customError';
import QueryString from 'qs';
import { transporter } from '../configs/nodemailer.config';
import { BookEntity } from '../entities/book.entity';

export class CommentService {
  constructor(
    private userRepository: Repository<UserEntity>,
    private commentRepository: Repository<CommentEntity>,
    private bookRepository: Repository<BookEntity>,
  ) {}

  async createComment(userId: number, id: number, createCommentDto: CommentDto): Promise<CommentEntity> {
    const comment = new CommentEntity();
    Object.assign(comment, createCommentDto);

    comment.user = await this.userRepository.findOneBy({ id: userId });
    comment.book = await this.bookRepository.findOneBy({ id });

    return await this.commentRepository.save(comment);
  }

  async addCommentToFavorites(userId: number, id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOneBy({ id });

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorite_comments'],
    });

    const isNotFavorited = user.favorite_comments.findIndex((commentInFavorites) => commentInFavorites.id === comment.id) === -1;

    if (isNotFavorited) {
      user.favorite_comments.push(comment);
      comment.favorites_count++;

      await this.userRepository.save(user);
      await this.commentRepository.save(comment);
    }

    return comment;
  }

  async deleteCommentToFavorites(userId: number, id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOneBy({ id });

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorite_comments'],
    });

    const commentIndex = user.favorite_comments.findIndex((commentInFavorites) => commentInFavorites.id === comment.id);

    if (commentIndex >= 0) {
      user.favorite_comments.splice(commentIndex, 1);
      comment.favorites_count--;

      await this.userRepository.save(user);
      await this.commentRepository.save(comment);
    }

    return comment;
  }

  async updateComment(userId: number, id: number, updateCommentDTO: CommentDto): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new CustomError(404, "Comment doesn't exist.");

    if (comment.user.id !== userId) throw new CustomError(403, "You aren't authhor this comment.");

    Object.assign(comment, updateCommentDTO);

    return await this.commentRepository.save(comment);
  }

  async deleteComment(userId: number, id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) throw new CustomError(404, "Comment doesn't exist.");

    if (comment.user.id !== userId && comment.user.role === 'user') throw new CustomError(403, "You aren't author this comment.");

    await this.commentRepository.delete({ id });
  }

  async findAll(userId: number, query: QueryString.ParsedQs) {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment').leftJoinAndSelect('comment.parentComment', 'parentComment');

    switch (query.rating) {
      case 'hight':
        queryBuilder.andWhere({ order: { favorites_count: 'DESC' } });
        break;
      case 'low':
        queryBuilder.andWhere({ order: { favorites_count: 'ASC' } });
        break;
    }

    let favoriteIds: number[] = [];

    if (userId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorite_comments'],
      });

      favoriteIds = currentUser.favorite_comments.map((favorite) => favorite.id);
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

  async addReplyToComment(userId: number, username: string, bookId: number, id: number, createCommentDto: CommentDto): Promise<CommentEntity> {
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
    await transporter.sendMail(mailOptions);

    return comment;
  }
}
