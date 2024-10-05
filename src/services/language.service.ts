import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { LanguageEntity } from '../entities/language.entity';
import { LanguageDto } from '../dto/bookAttributes.dto';

export class LanguageService {
  constructor(private readonly languageRepository: Repository<LanguageEntity>) {}

  async createLanguage(createLanguageDto: LanguageDto) {
    const language = await this.languageRepository.findOneBy({ name: createLanguageDto.name });

    if (language) throw new CustomError(404, 'Language name is taken.');

    Object.assign(language, createLanguageDto);

    return await this.languageRepository.save(language);
  }

  async updateLanguage(id: number, updateLanguageDto: LanguageDto) {
    const language = await this.languageRepository.findOneBy({ id });

    if (!language) throw new CustomError(404, "Language doesn't exist.");

    Object.assign(language, updateLanguageDto);

    return await this.languageRepository.save(language);
  }

  async deleteLanguage(id: number) {
    const language = await this.languageRepository.findOneBy({ id });

    if (!language) throw new CustomError(404, "Language doesn't exist.");

    await this.languageRepository.delete(language);
  }

  async findAll() {
    const languages = await this.languageRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return languages;
  }

  async getLanguage(id: number) {
    const language = await this.languageRepository.findOneBy({ id });

    if (!language) throw new CustomError(404, "Language doesn't exist.");

    return await this.languageRepository.findOneBy({ id });
  }
}
