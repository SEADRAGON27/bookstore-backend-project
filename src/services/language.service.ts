import { Repository } from 'typeorm';
import { CustomError } from '../utils/customError';
import { LanguageEntity } from '../entities/language.entity';
import { LanguageDto } from '../dto/bookAttributes.dto';

export class LanguageService {
  constructor(private readonly languageRepository: Repository<LanguageEntity>) {}

  async createLanguage(createLanguageDto: LanguageDto) {
    const language = await this.languageRepository.findOneBy({ name: createLanguageDto.name });

    if (language) throw new CustomError(404, 'Language name is taken.');

    const createLanguage = new LanguageEntity();

    Object.assign(createLanguage, createLanguageDto);

    return await this.languageRepository.save(createLanguage);
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

    return language;
  }
}
