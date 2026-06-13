import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import requestItemsQueryConfig from "./requestItems.model.config.js";

class requestItemsService {
  async findAll(query) {
    const options = buildQueryOptions(requestItemsQueryConfig, query);

    console.log("Query options:", options);

    options.where = {
      ...options.where,
      isDeleted: false,
    };

    const [data, count] = await Promise.all([
      prisma.requestItems.findMany(options),

      prisma.requestItems.count({
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
            currentPage,
            itemsPerPage,
            totalPages,
            totalItems: count,
          }
        : null,
    };
  }

  async create(data) {
    const { quantity, productId, requestId } = data;

    return prisma.requestItems.create({
      data: {
        quantity,

        request: {
          connect: {
            id: requestId,
          },
        },
        product: {
          connect: {
            id: productId,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
        productId: true,
        requestId: true,
      },
    });
  }

  async getById(id) {
    return prisma.requestItems.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        product: true,
        request: true,
      },
    });
  }

  async update(id, data) {
    const item = await prisma.requestItems.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        request: true,
      },
    });

    if (!item) {
      throw new Error("Request Item tidak ditemukan");
    }

    if (item.request.status !== "PENDING") {
      throw new Error("Request tidak dapat diubah");
    }

    return prisma.requestItems.update({
      where: {
        id,
      },
      data: {
        quantity: data.quantity,
      },
    });
  }

  async delete(id) {
    return prisma.requestItems.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
      select: {
        id: true,
        quantity: true,
        productId: true,
        requestId: true,
      },
    });
  }
}

export default new requestItemsService();
