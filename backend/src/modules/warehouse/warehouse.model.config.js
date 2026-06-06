const warehouseQueryConfig = {
    searchableFields: ["name", "address", "phone"],
    filterableFields: ["address"],
    relations: {
        company: true,
        users: true,
        transfers: true,
        warehouseStocks: true,
        purchaseRequests: true,
    },
};

export default warehouseQueryConfig;