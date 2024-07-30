import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { CreateUserResponse, UserResponse } from '../interfaces/userResponse.interface';
import { RefreshSessionEntity } from '../entities/refreshSession.entity';
import { CustomError } from '../interfaces/customError';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { CreateUserDto } from '../dto/createUser.dto';
import { LoginUserDTO } from '../dto/loginUser.dto';
import { UpdateUserDTO } from '../dto/updateUser.dto';
import { AuthTokens } from '../types/authTokens.type';
import { transporter } from '../configs/nodemailer.config';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordEntity } from '../entities/resetPassword.entity';
import { hash } from 'bcrypt';
import { Profile } from 'passport-google-oauth20';
import { PasswordResetDTO } from '../dto/passwordReset.dto';

export class UserService {
  constructor(
    private userRepository: Repository<UserEntity>,
    private refreshSessionRepository: Repository<RefreshSessionEntity>,
    private resetPasswordRepository: Repository<ResetPasswordEntity>,
  ) {}

  async createUser(createDto: CreateUserDto, finger_print: string): Promise<CreateUserResponse> {
    if (createDto.confirmedPassword !== createDto.password) throw new CustomError(422, "Password didn't match");

    const userByEmail = await this.userRepository.findOneBy({
      email: createDto.email,
    });

    const userByName = await this.userRepository.findOneBy({
      username: createDto.username,
    });

    if (userByEmail || userByName) throw new CustomError(422, 'name or email are taken');

    const newUser = new UserEntity();
    Object.assign(newUser, createDto);

    const token = uuidv4();

    newUser.confirmation_token = token;
    const user = await this.userRepository.save(newUser);
    const refresh_token = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      finger_print,
      refresh_token,
      user,
    });

    await this.sendVerificationEmail(user.email, user.confirmation_token);

    return { user, refresh_token };
  }

  async loginUser(loginUserDTO: LoginUserDTO, finger_print: string): Promise<CreateUserResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDTO.email },
      select: ['id', 'username', 'email', 'password'],
    });

    if (!user) throw new CustomError(422, 'User is unfound');

    const isPassword = await compare(loginUserDTO.password, user.password);

    if (!isPassword) throw new CustomError(422, 'Password is uncorrect');

    const refresh_token = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      finger_print,
      refresh_token,
      user,
    });

    delete user.password;

    return { user, refresh_token };
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

  async sendVerificationEmail(userEmail: string, token: string) {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: userEmail,
      subject: 'Confirm Email Address',
      text: `Please click on the link to confirm email ${process.env.CLIENT_URL}confirm/${token}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async updateUser(id: number, updateUserDTO: UpdateUserDTO): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    Object.assign(user, updateUserDTO);

    return await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    await this.refreshSessionRepository.delete(id);
    await this.userRepository.delete(id);
  }

  async confirmEmail(token: string, finger_print: string): Promise<CreateUserResponse> {
    const user = await this.userRepository.findOne({
      where: { confirmation_token: token },
    });

    const { refresh_token } = await this.refreshSessionRepository.findOne({
      where: { finger_print },
    });

    if (!user && !refresh_token) throw new CustomError(403, 'Invalid confirmation token');

    user.is_confirmed = true;
    user.confirmation_token = null;
    this.userRepository.save(user);

    return { user, refresh_token };
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    return user;
  }

  async deleteRefreshSession(refresh_token: string) {
    const refreshSession = await this.refreshSessionRepository.findOneBy({
      refresh_token,
    });

    if (refreshSession) await this.refreshSessionRepository.delete(refreshSession.id);
  }

  async refresh(currentRefreshToken: string, finger_print: string): Promise<AuthTokens> {
    if (!currentRefreshToken) throw new CustomError(401, 'Not authorized');

    const refreshSession = await this.refreshSessionRepository.findOneBy({
      refresh_token: currentRefreshToken,
    });

    if (!refreshSession) throw new CustomError(401, 'Not authorized');

    if (refreshSession.finger_print !== finger_print) throw new CustomError(403, 'Forbiden');

    let payload;

    try {
      payload = verify(currentRefreshToken, process.env.SECRET_PHRASE_ACCESS_TOKEN);
    } catch (err) {
      throw new CustomError(401, 'Forbiden');
    }

    await this.refreshSessionRepository.delete(refreshSession.id);

    const user = await this.userRepository.findOneBy({
      username: payload.user,
    });

    const accessToken: string = this.generateAccessToken(user);
    const refresh_token: string = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      finger_print,
      refresh_token,
      user,
    });

    return {
      accessToken,
      refresh_token,
      tokenExpiration: Number(process.env.ACCESS_TOKEN_EXPIRATION_30MINUTES),
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new CustomError(422, 'User is unfound');

    const token = uuidv4();

    const resetPasswordToken = this.resetPasswordRepository.create({
      user,
      token,
      expires_at: new Date(Date.now() + 3600000),
    });

    await this.resetPasswordRepository.save(resetPasswordToken);

    await this.sendResetPasswordEmail(user.email, token);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Confirm Email Address',
      text: `To reset your password, please click the following link: 
             ${process.env.CLIENT_URL}reset-password/${token}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async resetPassword(token: string, passwordResetDto: PasswordResetDTO) {
    const resetPasswordToken = await this.resetPasswordRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!resetPasswordToken || resetPasswordToken.expires_at < new Date()) {
      throw new CustomError(403, 'Invalid or expired token');
    }

    const hashedPassword = await hash(passwordResetDto.new_password, 10);
    resetPasswordToken.user.password = hashedPassword;

    await this.userRepository.save(resetPasswordToken.user);
    await this.resetPasswordRepository.delete(resetPasswordToken.id);
  }

  async finishGoogleAuthification(userId: number, finger_print: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const refresh_token = this.generateRefreshToken(user);

    await this.refreshSessionRepository.save({
      finger_print,
      refresh_token,
      user,
    });

    return { user, refresh_token };
  }

  async findOrCreate(profile: Profile) {
    const IsUser = await this.userRepository.findOneBy({ username: profile.id });

    if (IsUser) return IsUser;

    const user = new UserEntity();
    user.email = profile.emails[0].value;
    user.username = profile.displayName;
    user.google_id = profile.id;
    await this.userRepository.save(user);

    return user;
  }
}
