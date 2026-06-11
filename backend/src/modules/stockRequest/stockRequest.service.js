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
        const { notes, items, companiesId, storeId } = data;

        const code = await generateCode('REQ', 'stockRequest');

        return prisma.stockRequest.create({
            data: {
                code,
                notes,
                companiesId,
                storeId,
                requestItems: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                requestItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                unit: true,
                                code: true,
                            },
                        }
                    }
                },
                store: {
                    select: {
                        id: true,
                        name: true,
                    },
                }
            }
        });
    }
}

export default new stockRequestService();