const storeRequestModelConfig = {
    searchableFields: ['code'],
    filterableFields: ['status'],
    relations: {
        company: true,
        store: true,
        transfers: true,
        requestItems: true,
    }
}

export default storeRequestModelConfig;