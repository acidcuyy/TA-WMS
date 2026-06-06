const storeModelConfig = {
    searchableFields: ['name', 'phone', ],
    filterableFields: ['address'],
    relations: {
        company: true,
        users: true,
        transfers: true,
        storeStocks: true,
        storeRequests: true,
    },
}

export default storeModelConfig;