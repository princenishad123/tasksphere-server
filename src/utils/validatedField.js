import ApiError from "./ApiError.js";
const validateFields = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) throw new ApiError(400, `Please enter ${key} !`);
  }
};
export {validateFields}