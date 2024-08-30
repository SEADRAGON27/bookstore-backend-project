import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { CategoryService } from '../services/category.service';
import { logger } from '../logs/logger';

export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async createCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createCategoryDto = req.body;
      const userId = +req.user.id;

      const category = await this.categoryService.createCategory(userId, createCategoryDto);

      res.status(201).json(category);
      logger.info({ userId, createCategoryDto }, 'Creating a new category successfully');
    
    } catch (error) {
      
        logger.error(error, 'Error creating a new category');
        next(error);
    
    }
  }

  async updateCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateCategoryDto = req.body;
      const userId = +req.user.id;

      const category = await this.categoryService.updateCategory(userId, updateCategoryDto);

      res.status(200).json(category);
      logger.info({ userId, updateCategoryDto }, 'Updating category successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating category');
      next(error);
    
    }
  }

  async deleteCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.categoryService.deleteCategory(id);

      res.status(200).json({ message: 'Category has been deleted.' });
      logger.info({ id }, 'Deleting a category successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error delating category');
      next(error);
    
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const categories = await this.categoryService.findAll();

      res.send(200).json(categories);
      logger.info('Fetching categories successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching categories');
      next(error);
    
    }
  }

  async getCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      const category = await this.categoryService.getAuthor(id);

      logger.info({ id }, 'Fetching category is successfully');
      res.status(200).json(category);
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching category');
      next(error);
    
    }
  }
}
