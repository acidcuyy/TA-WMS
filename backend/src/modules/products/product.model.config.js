const productQueryConfig = {
  searchableFields: ["code", "name"],
  filterableFields: ["name"],
  relations: {
    company: true,
    transfersItems: true,
    warehouseStocks: true,
    requestItems: true,
    storeStocks: true,
    purchaseRequestItems: true,
  },
};

export default productQueryConfig;
