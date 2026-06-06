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

    const [users, count] = await Promise.all([
      prisma.user.findMany({
        ...options,
      }),

      prisma.user.count({
        where: options.where,
      }),
    ]);

    const data = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

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

  async findById(id) {
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

  async update(id, data) {
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

  async delete(id) {
    return prisma.user.update({
      where: { id, isDeleted: false },
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