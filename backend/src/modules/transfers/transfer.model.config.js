const transferQueryConfig = {
  searchableFields: ["code", "status"],
  filterableFields: ["code", "status"],
  relations: {
    driver: true,
    company: true,
    toStore: true,
    fromWarehouse: true,
    request: true,
  },
};

export default transferQueryConfig;
