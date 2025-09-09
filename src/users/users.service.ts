import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    const existingUsername = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    } else if (existingUsername) {
      throw new ConflictException('Username already exists');
    }
    // const salt_rounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS')
    const salt_rounds =
      this.configService.get<number>('BCRYPT_SALT_ROUNDS') ?? 10;
    const salt = await bcrypt.genSalt(Number(salt_rounds));
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string): Promise<User | null> {
    const user = this.usersRepository.findOne({ where: { id } });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.usersRepository.update(userId, {
      refresh_token: hashedRefreshToken,
    });
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   const user = this.repo.update(id, updateUserDto);
  //   console.log(user);
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
