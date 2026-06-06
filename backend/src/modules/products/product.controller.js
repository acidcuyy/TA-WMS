import productService from "./product.service.js";
import { createUserSchema, updateUserSchema } from "./product.validate.js";

class ProductController {
  async getAll(req, res) {
    try {
      const products = await productService.findAll(req.body);
      return res.json({
        success: true,
        message: "Products retrieved successfully",
        data: products.data,
        meta: products.meta,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const product = await productService.create(validatedData);
      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const id = parseInt(req.params.id);
      const product = await productService.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      return res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const id = parseInt(req.params.id);
      const validateData = updateUserSchema.parse(req.body);

      const updatedProduct = await productService.update(id, validateData);

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      return res.json({
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          errors: error.errors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const id = parseInt(req.params.id);
      const deletedProduct = await productService.delete(id);
      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      return res.json({
        success: true,
        data: deletedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ProductController();