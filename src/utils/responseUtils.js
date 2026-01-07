// src/utils/responseUtils.js
export const createJSONResponse = (code, message, data, others) => {
  const response = { code, message, data };
  if (others) response.others = others;
  return response;
};
