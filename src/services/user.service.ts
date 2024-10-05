/* eslint-disable prefer-const */
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserResponse, UserResponse } from '../interfaces/userResponse.interface';
import { RefreshSessionEntity } from '../entities/refreshSession.entity';
import { CustomError } from '../interfaces/customError';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { CreateUserDto, CreateUserGoogleDto } from '../dto/createUser.dto';
import { LoginUserDto } from '../dto/loginUser.dto';
import { UpdateUserDto } from '../dto/updateUser.dto';
import { AuthTokens } from '../types/authTokens.type';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordEntity } from '../entities/resetPassword.entity';
import { hash } from 'bcrypt';
import { PasswordResetDTO } from '../dto/passwordReset.dto';
import { NotificationService } from './notification.service';

export class UserService {
  constructor(
    private readonly userRepository: Repository<UserEntity>,
    private readonly refreshSessionRepository: Repository<RefreshSessionEntity>,
    private readonly resetPasswordRepository: Repository<ResetPasswordEntity>,
    private readonly notificationService: NotificationService,
  ) {}

  async createUser(createUserDto: CreateUserDto, fingerprint: string): Promise<void> {
    if (createUserDto.confirmedPassword !== createUserDto.password) throw new CustomError(422, "Password didn't match");

    const userByEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });

    const userByName = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });

    if (userByEmail || userByName) throw new CustomError(422, 'Name or email is taken');

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    const token = uuidv4();

    newUser.confirmationToken = token;
    newUser.password = await hash(createUserDto.password, 10);

    const user = await this.userRepository.save(newUser);
    const refreshToken = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      fingerprint,
      refreshToken,
      user,
    });

    await this.notificationService.sendVerificationEmail(user.email, user.confirmationToken);
  }

  async loginUser(loginUserDto: LoginUserDto, fingerprint: string): Promise<CreateUserResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: ['id', 'username', 'password', 'email', 'role', 'isConfirmed'],
    });

    if (user.isConfirmed === false) throw new CustomError(422, 'Email is not confirmed');

    if (!user) throw new CustomError(422, 'User is unfound');

    const isPassword = await compare(loginUserDto.password, user.password);

    if (!isPassword) throw new CustomError(422, 'Password is uncorrect');

    const refreshToken = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      fingerprint,
      refreshToken,
      user,
    });

    delete user.password;

    return { user, refreshToken };
  }

  buildUserResponse(user: UserEntity): UserResponse {
    return {
      user: {
        ...user,
        token: this.generateAccessToken(user),
        tokenExpiration: Number(process.env.ACCESS_TOKEN_EXPIRATION_30MINUTES),
      },
    };
  }

  generateRefreshToken(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_PHRASE_REFRESH_TOKEN,
      { expiresIn: '15d' },
    );
  }

  generateAccessToken(user: UserEntity): string {
    return sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_PHRASE_ACCESS_TOKEN,
      { expiresIn: '30m' },
    );
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<CreateUserResponse> {
    const user = await this.userRepository.findOneBy({ id });
    const token = uuidv4();

    if (updateUserDto.email) {
      user.confirmationToken = token;
      await this.userRepository.save(user);
      await this.notificationService.sendVerificationEmail(updateUserDto.email, token);

      return null;
    }

    if (updateUserDto.username) {
      const username = updateUserDto.username;
      const userByName = await this.userRepository.findOneBy({ username });

      if (userByName) throw new CustomError(422, 'Username is taken');

      user.username = updateUserDto.username;

      const updateUser = await this.userRepository.save(user);
      const refreshToken = this.generateRefreshToken(updateUser);

      delete updateUser.password;

      return { user: { ...updateUser }, refreshToken };
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async confirmEmail(token: string, fingerprint: string): Promise<CreateUserResponse> {
    const user = await this.userRepository.findOne({
      where: { confirmationToken: token },
    });

    const { refreshToken } = await this.refreshSessionRepository.findOne({
      where: { fingerprint },
    });

    if (!user && !refreshToken) throw new CustomError(403, 'Invalid confirmation token');

    user.isConfirmed = true;
    user.confirmationToken = null;
    await this.userRepository.save(user);
    delete user.password;

    return { user, refreshToken };
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    return user;
  }

  async deleteRefreshSession(refreshToken: string) {
    const { id } = await this.refreshSessionRepository.findOneBy({
      refreshToken,
    });

    if (id) await this.refreshSessionRepository.delete(id);
  }

  async refresh(currentRefreshToken: string, fingerprint: string): Promise<AuthTokens> {
    if (!currentRefreshToken) throw new CustomError(401, 'Not authorized');

    const refreshSession = await this.refreshSessionRepository.findOneBy({
      refreshToken: currentRefreshToken,
    });

    if (!refreshSession) throw new CustomError(401, 'Not authorized');

    if (refreshSession.fingerprint !== fingerprint) throw new CustomError(403, 'Forbiden');

    let payload;

    try {
      payload = verify(currentRefreshToken, process.env.SECRET_PHRASE_ACCESS_TOKEN);
    } catch (err) {
      throw new CustomError(401, 'Forbiden');
    }

    await this.refreshSessionRepository.delete(refreshSession.id);

    const user = await this.userRepository.findOneBy({
      username: payload.id,
    });

    const accessToken: string = this.generateAccessToken(user);
    const refreshToken: string = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      fingerprint,
      refreshToken,
      user,
    });

    return {
      accessToken,
      refreshToken,
      tokenExpiration: +process.env.ACCESS_TOKEN_EXPIRATION_30MINUTES,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new CustomError(422, 'User is unfound');

    const token = uuidv4();

    const resetPasswordToken = this.resetPasswordRepository.create({
      user,
      token,
      expiresAt: new Date(Date.now() + 3600000),
    });

    await this.resetPasswordRepository.save(resetPasswordToken);

    await this.notificationService.sendResetPasswordEmail(user.email, token);
  }

  async resetPassword(token: string, passwordResetDto: PasswordResetDTO) {
    const resetPasswordToken = await this.resetPasswordRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!resetPasswordToken || resetPasswordToken.expiresAt < new Date()) {
      throw new CustomError(403, 'Invalid or expired token');
    }

    const hashedPassword = await hash(passwordResetDto.newPassword, 10);
    resetPasswordToken.user.password = hashedPassword;

    await this.userRepository.save(resetPasswordToken.user);
    await this.resetPasswordRepository.delete(resetPasswordToken.id);
  }

  async finishGoogleAuth(createUserGoogleDto: CreateUserGoogleDto, email: string, fingerprint: string): Promise<CreateUserResponse> {
    const userByName = await this.userRepository.findOneBy({ username: createUserGoogleDto.username });
    const user = await this.userRepository.findOneBy({ email });

    if (userByName?.username && user?.username && userByName.username === user.username) {
      const refreshToken = this.generateRefreshToken(user);

      await this.refreshSessionRepository.save({
        fingerprint,
        refreshToken,
        user,
      });

      return { refreshToken, user };
    }

    if (userByName) throw new CustomError(422, 'Name is taken');

    if (!user) {
      let user = new UserEntity();
      Object.assign(user, createUserGoogleDto);

      user.isConfirmed = true;
      user.email = email;
      const createdUser = await this.userRepository.save(user);

      const refreshToken = this.generateRefreshToken(createdUser);

      await this.refreshSessionRepository.save({
        fingerprint,
        refreshToken,
        user: { ...createdUser },
      });
      delete createdUser.password;

      return { refreshToken, user: { ...createdUser } };
    }

    const refreshToken = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      fingerprint,
      refreshToken,
      user,
    });

    return { user, refreshToken };
  }
}
