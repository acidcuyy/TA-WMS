import prisma from "../../config/database.js";

class warehosueService {
  async getWarehouse() {
    return prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        category: true,
      },
    });
  }

  async createWarehouse(data) {
    return prisma.warehouse.create({
      data,
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        category: true,
      },
    });
  }

  async updateWarehouse(id, data) {
    return prisma.warehouse.update({
      where: {
        id: Number(id),
      },
      data,
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        category: true,
      },
    });
  }

  async getWarehouseById(id) {
    return prisma.warehouse.findUnique({
        where: {id, isDeleted: false},
        select: {
            id: true,
            name: true,
            location: true,
            capacity: true,
            category: true,
        },
    });
  }

  async deletedWarehouse(id) {
    return prisma.warehouse.update({
        where: { id },
        data: {
            isDeleted: true,
        },
        select: {
            id: true,
            name: true,
            location: true,
            category: true,
        }
    })
  }
}

export default new warehosueService();
