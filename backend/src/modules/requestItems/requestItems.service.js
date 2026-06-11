import prisma from "../../../config/database.js";
import { buildQueryOptions } from "../../../utils/buildQueryOptions.js";
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
        return prisma.requestItems.create({
            data,
            select: {
                id: true,
                productId: true,
                quantity: true,
                stockRequestId: true,
            },
        });
    }
}