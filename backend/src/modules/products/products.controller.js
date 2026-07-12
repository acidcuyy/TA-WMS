import prisma from "../../config/database.js";

class ProductsController {
  async getProducts(req, res) {
    try {
      const companyId = req.user.companyId;
      const products = await prisma.product.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" }
      });

      return res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createProduct(req, res) {
    try {
      const companyId = req.user.companyId;
      const { sku, name, category, unit, price, image } = req.body;

      if (!sku || !name || !category) {
        return res.status(400).json({
          success: false,
          message: "sku, name, and category are required",
        });
      }

      // Check if SKU already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Kode barang / SKU '${sku}' sudah terdaftar`,
        });
      }

      const product = await prisma.product.create({
        data: {
          sku,
          name,
          category,
          unit: unit || "pcs",
          price: price ? parseFloat(price) : 0,
          image: image || null,
          companyId,
        }
      });

      return res.status(201).json({
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

  async updateProduct(req, res) {
    try {
      const { sku } = req.params;
      const companyId = req.user.companyId;
      const { name, category, unit, price, image } = req.body;

      // Verify product belongs to same company
      const existingProduct = await prisma.product.findFirst({
        where: { sku, companyId }
      });

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const updatedProduct = await prisma.product.update({
        where: { sku },
        data: {
          name: name !== undefined ? name : undefined,
          category: category !== undefined ? category : undefined,
          unit: unit !== undefined ? unit : undefined,
          price: price !== undefined ? parseFloat(price) : undefined,
          image: image !== undefined ? image : undefined,
        }
      });

      return res.json({
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { sku } = req.params;
      const companyId = req.user.companyId;

      // Verify product belongs to same company
      const existingProduct = await prisma.product.findFirst({
        where: { sku, companyId }
      });

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      await prisma.product.delete({
        where: { sku }
      });

      return res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ProductsController();
