const StoreStockQueryConfig = {
  searchableFields: ["quantity"],
  filterableFields: ["quantity"],
  relations: {
    product: true,
    store: true,
  },
};

export default StoreStockQueryConfig;
