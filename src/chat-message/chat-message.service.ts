import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { UpdateChatMessageDto } from './dto/update-chat-message.dto';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
  ) {}

  async create(senderId: string, createChatMessageDto: CreateChatMessageDto) {
    const message = this.messageRepository.create({
      senderId,
      ...createChatMessageDto,
    });

    return this.messageRepository.save(message);
  }

  async findBySessionId(
    sessionId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { sessionId },
      relations: ['sender'],
      order: { sentAt: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const [messages, total] = await this.messageRepository.findAndCount({
      relations: ['sender', 'session'],
      order: { sentAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'session'],
    });

    if (!message) {
      throw new NotFoundException('Chat message not found');
    }

    return message;
  }

  async update(id: string, updateChatMessageDto: UpdateChatMessageDto) {
    const message = await this.findOne(id);
    Object.assign(message, updateChatMessageDto);
    return this.messageRepository.save(message);
  }

  async remove(id: string) {
    const message = await this.findOne(id);
    return this.messageRepository.remove(message);
  }
}
