import prisma from "../../config/database.js";

class UserService {
  async getUsers() {
    return prisma.user.findMany({
      where: {
        isDeleted: false,
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
