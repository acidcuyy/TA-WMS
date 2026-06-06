import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import productQueryConfig from "./product.model.config.js";

class ProductService {
  async findAll(query) {
    const options = buildQueryOptions(productQueryConfig, query);

    console.log("Query options:", options);
    options.where = {
      ...options.where,
      isDeleted: false,
    };
    const [data, count] = await Promise.all([
      prisma.product.findMany(options),
      prisma.product.count({
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
    return prisma.product.create({
      data,
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        companiesId: true,
      },
    });
  }

  async findById(id) {
    return prisma.product.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        companiesId: true,
      },
    });
  }

  async update(id, data) {
    return prisma.product.update({
      where: { id, isDeleted: false },
      data,
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        companiesId: true,
      },
    });
  }

  async delete(id) {
    return prisma.product.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        companiesId: true,
      },
    });
  }
}

export default new ProductService();
