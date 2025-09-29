import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreference } from './entities/user-preference.entity';

@Injectable()
export class UserPreferenceService {
  constructor(
    @InjectRepository(UserPreference)
    private preferenceRepository: Repository<UserPreference>,
  ) {}

  async create(
    userId: string,
    createUserPreferenceDto: CreateUserPreferenceDto,
  ) {
    // Check if preference already exists
    const existing = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (existing) {
      // Update existing preference
      return this.update(userId, createUserPreferenceDto);
    }

    const preference = this.preferenceRepository.create({
      userId,
      ...createUserPreferenceDto,
    });

    return this.preferenceRepository.save(preference);
  }

  async findByUserId(userId: string) {
    const preference = await this.preferenceRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!preference) {
      throw new NotFoundException('User preferences not found');
    }

    return preference;
  }

  async update(
    userId: string,
    updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    const preference = await this.findByUserId(userId);

    Object.assign(preference, updateUserPreferenceDto);
    return this.preferenceRepository.save(preference);
  }

  async remove(userId: string) {
    const preference = await this.findByUserId(userId);
    return this.preferenceRepository.remove(preference);
  }

  async findAll() {
    return this.preferenceRepository.find({
      relations: ['user'],
    });
  }
}
