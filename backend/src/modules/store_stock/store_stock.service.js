import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import storeStockQueryConfig from "./store_stock.model.config.js";

class StoreStockService {
  async findAll(query) {
    const options = buildQueryOptions(storeStockQueryConfig, query);

    console.log("Query options:", options);

    options.where = {
      ...options.where,
      isDeleted: false,
    };
    const [data, count] = await Promise.all([
      prisma.storeStock.findMany(options),

      prisma.storeStock.count({
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
    const exsistingStock = await prisma.storeStock.findFirst({
      where: {
        storeId: data.storeId,
        productId: data.productId,
        isDeleted: false,
      },
    });

    if (exsistingStock) {
      throw new Error("Stock for this product in the store already exists");
    }

    return prisma.storeStock.create({
      data,
      select: {
        id: true,
        quantity: true,
        storeId: true,
        productId: true,
      },
    });
  }

  async findById(id) {
    return prisma.storeStock.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        quantity: true,
        store: {
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
    const existingStock = await prisma.storeStock.findFirst({
      where: {
        storeId: data.storeId,
        productId: data.productId,
        isDeleted: false,
      },
    });

    if (existingStock) {
      throw new Error("Stock for this product in the store already exists");
    }

    return prisma.storeStock.update({
      where: { id, isDeleted: false },
      data,
      select: {
        id: true,
        quantity: true,
        storeId: true,
        productId: true,
      },
    });
  }

  async delete(id) {
    return prisma.storeStock.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
      select: {
        id: true,
        quantity: true,
        storeId: true,
        productId: true,
      },
    });
  }
}

export default new StoreStockService();
