import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import warehouseQueryConfig from "./warehouse.model.config.js";

class WarehouseService {
  async findAll(query) {
    const options = buildQueryOptions(warehouseQueryConfig, query);

    console.log("Query options:", options);

    options.where = {
      ...options.where,
      isDeleted: false,
    };

    const [data, count] = await Promise.all([
      prisma.warehouse.findMany(options),

      prisma.warehouse.count({ 
        where: options.where 
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
    return prisma.warehouse.create({
      data,
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });
  }

  async getByid(id) {
    return prisma.warehouse.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });
  }

  async update(id, data) {
    return prisma.warehouse.update({
      where: { id, isDeleted: false },
      data,
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });
  }

  async delete(id) {
    return prisma.warehouse.update({
      where: { id, isDeleted: false },
      data: { isActive: false, isDeleted: true },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });
  }
}

export default new WarehouseService();