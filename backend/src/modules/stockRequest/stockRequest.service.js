import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import stockRequestQueryConfig from "./stockRequest.model.config.js";
import { generateCode } from "../../utils/generateCode.js";

class stockRequestService {
  async findAll(query) {
    const options = buildQueryOptions(stockRequestQueryConfig, query);

    console.log("Query options:", options);

    options.where = {
      ...options.where,
      isDeleted: false,
    };

    const [data, count] = await Promise.all([
      prisma.stockRequest.findMany(options),

      prisma.stockRequest.count({
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
    const { notes, companiesId, storeId } = data;

    const code = await generateCode("REQ", "stockRequest");

    // console.log("CODE:", code);
    // console.log(typeof code);
    // console.log(data);
    // console.log("storeId:", storeId);
    // console.log("companiesId:", companiesId);

    return prisma.stockRequest.create({
      data: {
        notes,
        code,

        company: {
          connect: {
            id: companiesId,
          },
        },
        store: {
          connect: {
            id: storeId,
          },
        },
      },
      select: {
        id: true,
        code: true,
        notes: true,
        status: true,
        companiesId: true,
        storeId: true,
        createdAt: true,
      },
    });
  }

  async getById(id) {
    return prisma.stockRequest.findFirst({
      where: { id, isDeleted: false },
      include: {
        requestItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.stockRequest.update({
      where: { id, isDeleted: false },
      data: {
        notes: data.notes,
        status: data.status,
      },
      select: {
        id: true,
        code: true,
        notes: true,
        status: true,
        companiesId: true,
        storeId: true,
        createdAt: true,
      },
    });
  }

  async delete(id) {
    return prisma.stockRequest.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true },
      select: {
        id: true,
        code: true,
        notes: true,
        status: true,
        companiesId: true,
        storeId: true,
        createdAt: true,
      },
    });
  }
}

export default new stockRequestService();
