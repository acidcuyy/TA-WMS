import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import userQueryConfig from "./user.model.config.js";

class UserService {
  async findAll(query) {
    const options = buildQueryOptions(userQueryConfig, query);

    console.log("Query options:", options);

    options.where = {
      ...options.where,
      isDeleted: false,
    };

    const [data, count] = await Promise.all([
      prisma.user.findMany(options),

      prisma.user.count({
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

  async createUser(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
      },
    });
  }

  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
      },
    });
  }

  async updateUser(id, data) {
    return prisma.user.update({
      where: { id, isDeleted: false },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
      },
    });
  }

  async deleteUser(id) {
    return prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        role: true,
      },
    });
  }
}

export default new UserService();
