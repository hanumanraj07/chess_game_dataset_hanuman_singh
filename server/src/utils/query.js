const stripQueryKeys = (query = {}, keys = []) => {
  const clean = { ...query };
  keys.forEach((key) => delete clean[key]);
  return clean;
};

module.exports = { stripQueryKeys };
