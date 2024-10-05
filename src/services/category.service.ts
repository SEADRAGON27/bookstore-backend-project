import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryDto } from '../dto/bookAttributes.dto';

export class CategoryService {
  constructor(private readonly categoryRepository: Repository<CategoryEntity>) {}

  async createCategory(createCategoryDto: CategoryDto) {
    const category = await this.categoryRepository.findOneBy({ name: createCategoryDto.name });

    if (category) throw new CustomError(404, 'Category name is taken.');

    Object.assign(category, createCategoryDto);

    return await this.categoryRepository.save(category);
  }

  async updateCategory(id: number, updateCategoryDto: CategoryDto) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new CustomError(404, "Category doesn't exist.");

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
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

  async getСategory(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new CustomError(404, "Category doesn't exist.");

    return await this.categoryRepository.findOneBy({ id });
  }
}
