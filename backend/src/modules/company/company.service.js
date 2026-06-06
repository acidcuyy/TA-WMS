import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import companyQueryConfig from "./company.model.config.js";

class CompanyService {
  async findAll(query) {
    const options = buildQueryOptions(companyQueryConfig, query);

    console.log("Query options:", options);

    options.where = {
      ...options.where,
      isDeleted: false,
    };

    const [data, count] = await Promise.all([
      prisma.companies.findMany(options),

      prisma.companies.count({
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
    return prisma.companies.create({
      data,
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });
  }

  async findById(id) {
    return prisma.companies.findUnique({
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
    return prisma.companies.update({
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
    return prisma.companies.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
      },
    });
  }
}

export default new CompanyService();
