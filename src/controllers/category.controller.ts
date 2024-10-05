import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { CategoryService } from '../services/category.service';
import { WinstonLoggerService } from '../logs/logger';
import { exceptionType } from '../utils/exceptionType';

export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createCategoryDto = req.body;

      const category = await this.categoryService.createCategory(createCategoryDto);

      res.status(201).json(category);
      this.logger.log(`Category created successfully. Category Data: ${JSON.stringify(createCategoryDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating category. Error: ${error.message}`);

      next(error);
    }
  }

  async updateCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateCategoryDto = req.body;
      const userId = +req.user.id;

      const category = await this.categoryService.updateCategory(userId, updateCategoryDto);

      res.status(200).json(category);
      this.logger.log(`Category updated successfully. User ID: ${userId}, Updated Data: ${JSON.stringify(updateCategoryDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating category. User ID: ${req.user.id}, Category ID: ${req.params.id}. Error: ${error.message}`);

      next(error);
    }
  }

  async deleteCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.categoryService.deleteCategory(id);

      res.status(200).json({ message: 'Category has been deleted.' });
      this.logger.log(`Category deleted successfully. Category ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting category. Category ID: ${req.params.id}. Error: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const categories = await this.categoryService.findAll();

      res.status(200).json(categories);
      this.logger.log('Categories fetched successfully.');
    } catch (error) {
      this.logger.error(`Error fetching categories. Error: ${error.message}`);
      next(error);
    }
  }

  async getCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      const category = await this.categoryService.getСategory(id);

      res.status(200).json(category);
      this.logger.log(`Category fetched successfully. Category ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error fetching category. Category ID: ${req.params.id}. Error: ${error.message}`);

      next(error);
    }
  }
}
