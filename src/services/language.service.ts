import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { LanguageEntity } from '../entities/language.entity';
import { BookAttributesDto } from '../dto/bookAttributes.dto';

export class LanguageService {
  constructor(private languageRepository: Repository<LanguageEntity>) {}

  async createLanguage(id: number, createLanguageDto: BookAttributesDto) {
    let language = new LanguageEntity();
    Object.assign(language, createLanguageDto);

    language = await this.languageRepository.save(language);

    return language;
  }

  async updateLanguage(id: number, updateLanguageDto: BookAttributesDto) {
    let language = await this.languageRepository.findOneBy({ id });

    if (!language) throw new CustomError(404, "Language doesn't exist.");

    Object.assign(language, updateLanguageDto);

    language = await this.languageRepository.save(language);

    return language;
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
    return await this.languageRepository.findOneBy({ id });
  }
}
