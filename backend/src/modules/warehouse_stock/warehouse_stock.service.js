import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import warehouseStockQueryConfig from "./warehouse_stock.model.config.js";

class WarehouseStockService {
  async findAll(query) {
    const options = buildQueryOptions(warehouseStockQueryConfig, query);

    console.log("Query options:", options);
    options.where = {
      ...options.where,
      isDeleted: false,
    };
    const [data, count] = await Promise.all([
      prisma.warehouseStock.findMany(options),

      prisma.warehouseStock.count({
        where: options.where,
      }),
    ]);
    const currentPage = query?.pagination?.page ?? 1;

    const itemsPerPage = query?.pagination?.limit ?? 100;
    const totalPages = Math.ceil(count / itemsPerPage);

    return {
      data,
      meta: query?.pagination
        ? {
            totalItems: count,
            totalPages,
            currentPage,
            itemsPerPage,
          }
        : null,
    };
  }

  async create(data) {
    const exsistingStock = await prisma.warehouseStock.findFirst({
      where: {
        warehouseId: data.warehouseId,
        productId: data.productId,
        isDeleted: false,
      },
    });

    if (exsistingStock) {
      throw new Error("Stock for this product in the warehouse already exists");
    }

    return prisma.warehouseStock.create({
      data,
      select: {
        id: true,
        quantity: true,
        warehouseId: true,
        productId: true,
      },
    });
  }

  async findById(id) {
    return prisma.warehouseStock.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        quantity: true,
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    const existingStock = await prisma.warehouseStock.findFirst({
      where: {
        warehouseId: data.warehouseId,
        productId: data.productId,
        isDeleted: false,
        NOT: {
          id,
        },
      },
    });

    if (existingStock) {
      throw new Error("Stock for this product in the warehouse already exists");
    }

    return prisma.warehouseStock.update({
      where: { id, isDeleted: false },
      data,
      select: {
        id: true,
        quantity: true,
        warehouseId: true,
        productId: true,
      },
    });
  }

  async delete(id) {
    return prisma.warehouseStock.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
      select: {
        id: true,
        quantity: true,
        warehouseId: true,
        productId: true,
      },
    });
  }
}

export default new WarehouseStockService();
