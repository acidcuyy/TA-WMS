import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import transferQueryConfig from "./transfer.model.config.js";

class TransferService {
  async findAll(query) {
    const options = buildQueryOptions(transferQueryConfig, query);

    options.where = {
      ...options.where,
      isDeleted: false,
    };

    const [data, count] = await Promise.all([
      prisma.transfer.findMany(options),
      prisma.transfer.count({
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
    const existingTransfer = await prisma.transfer.findFirst({
      where: {
        requestId: data.requestId,
        toStoreId: data.toStoreId,
        fromWarehouseId: data.fromWarehouseId,
        isDeleted: false,
      },
    });

    if (existingTransfer) {
      throw new Error(
        "A transfer with the same request, store, and warehouse already exists",
      );
    }

    return prisma.transfer.create({
      data,
      select: {
        id: true,
        driverId: true,
        companyId: true,
        requestId: true,
        toStoreId: true,
        fromWarehouseId: true,
      },
    });
  }

  async findById(id) {
    return prisma.transfer.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      select: {
        id: true,
        code: true,
        status: true,
        driver: {
          select: {
            id: true,
            name: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        toStore: {
          select: {
            id: true,
            name: true,
          },
        },
        fromWarehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        request: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    const existingTransfer = await prisma.transfer.findFirst({
      where: {
        requestId: data.requestId,
        toStoreId: data.toStoreId,
        fromWarehouseId: data.fromWarehouseId,
        isDeleted: false,
        NOT: {
          id,
        },
      },
    });

    if (existingTransfer) {
      throw new Error(
        "A transfer with the same request, store, and warehouse already exists",
      );
    }

    return prisma.transfer.update({
      where: {
        id,
        isDeleted: false,
      },
      data,
      select: {
        id: true,
        code: true,
        status: true,
        driverId: true,
        companyId: true,
        requestId: true,
        toStoreId: true,
        fromWarehouseId: true,
      },
    });
  }

  async delete(id) {
    return prisma.transfer.update({
      where: {
        id,
        isDeleted: false,
      },
      data: { isDeleted: true },
      select: {
        id: true,
        code: true,
        status: true,
        driverId: true,
        companyId: true,
        requestId: true,
        toStoreId: true,
        fromWarehouseId: true,
      },
    });
  }
}

export default new TransferService();
