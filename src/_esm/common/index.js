export { Amount } from "./amount.js";
export { BaseError, HttpRequestError } from "./error.js";
export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_YEAR = 365;
export const perDay = (value) => value * SECONDS_PER_DAY;
export const calculateApy = (value) => ((value * SECONDS_PER_DAY + 1) ** DAYS_PER_YEAR - 1) * 100;
//# sourceMappingURL=index.js.map