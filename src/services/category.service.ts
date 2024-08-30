import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { CategoryEntity } from '../entities/category.entity';
import { BookAttributesDto } from '../dto/bookAttributes.dto';

export class CategoryService {
  constructor(private categoryRepository: Repository<CategoryEntity>) {}

  async createCategory(id: number, createCategoryDto: BookAttributesDto) {
    let category = new CategoryEntity();
    Object.assign(category, createCategoryDto);

    category = await this.categoryRepository.save(category);

    return category;
  }

  async updateCategory(id: number, updateCategoryDto: BookAttributesDto) {
    let category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new CustomError(404, "Category doesn't exist.");

    Object.assign(category, updateCategoryDto);

    category = await this.categoryRepository.save(category);

    return category;
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new CustomError(404, "Category doesn't exist.");

    await this.categoryRepository.delete(category);
  }

  async findAll() {
    const categories = await this.categoryRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return categories;
  }

  async getAuthor(id: number) {
    return await this.categoryRepository.findOneBy({ id });
  }
}
