import prisma from "../../config/database.js";
import { buildQueryOptions } from "../../utils/buildQueryOptions.js";
import storeQueryConfig from "./store.model.config.js";

class StoreService {
    async findAll(query) {
        const options = buildQueryOptions(storeQueryConfig, query);

        console.log("Query options:", options);

        options.where = {
            ...options.where,
            isDeleted: false,
        };
        
        const [data, count] = await Promise.all([
            prisma.stores.findMany(options),

            prisma.stores.count({
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
        return prisma.stores.create({
            data,
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                companiesId: true,
            },
        });
    }

    async getByid(id) {
        return prisma.stores.findUnique({
            where: { id, isActive: true, isDeleted: false },
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                companiesId: true,
            },
        });
    }

    async update(id, data) {
        return prisma.stores.update({
            where: { id, isActive: true, isDeleted: false },
            data,
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                companiesId: true,
            },
        });
    }

    async delete(id) {
        return prisma.stores.update({
            where: { id, isActive: true, isDeleted: false },
            data: { isActive: false, isDeleted: true },
            select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                companiesId: true,
            },
        });
    }
}

export default new StoreService();