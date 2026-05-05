import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { UpdatePreferencesDto } from "./dtos/update-preferences.dto";
import { UserResponseDto } from "./user-response.dto";

import { Injectable } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { ConflictException } from "@nestjs/common";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async findById(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.findById(userId);
    return this.toResponseDto(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(userId);

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    await this.userRepo.save(user);

    return this.toResponseDto(user);
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(userId);

    if (dto.currency !== undefined) {
      user.currency = dto.currency;
    }

    if (dto.timezone !== undefined) {
      user.timezone = dto.timezone;
    }

    if (dto.dark_mode !== undefined) {
      user.dark_mode = dto.dark_mode;
    }

    await this.userRepo.save(user);

    return this.toResponseDto(user);
  }

  toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      timezone: user.timezone,
      dark_mode: user.dark_mode,
      is_email_verified: user.is_email_verified,
      created_at: user.created_at,
    };
  }
}