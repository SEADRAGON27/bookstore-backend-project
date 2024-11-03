import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { CategoryService } from '../services/category.service';
import { Log } from '../decorators/log.decorator';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Log({ body: true, user: true })
  async createCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    const createCategoryDto = req.body;

    const category = await this.categoryService.createCategory(createCategoryDto);

    res.status(201).json(category);
  }

  @Log({ body: true, user: true })
  async updateCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    const updateCategoryDto = req.body;
    const userId = +req.user.id;

    const category = await this.categoryService.updateCategory(userId, updateCategoryDto);

    res.status(200).json(category);
  }

  @Log({ params: true, user: true })
  async deleteCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    await this.categoryService.deleteCategory(id);

    res.status(200).json({ message: 'Category has been deleted.' });
  }

  @Log({})
  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const categories = await this.categoryService.findAll();

    res.status(200).json(categories);
  }

  @Log({ params: true })
  async getCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    const category = await this.categoryService.getСategory(id);

    res.status(200).json(category);
  }
}
