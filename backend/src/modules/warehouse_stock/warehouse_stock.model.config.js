const warehouseStockQueryConfig = {
  searchableFields: ["quantity"],
  filterableFields: ["quantity"],
  relations: {
    product: true,
    warehouse: true,
  },
};

export default warehouseStockQueryConfig;
