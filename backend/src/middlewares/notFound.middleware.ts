import { NotFoundError } from "@/errors/errorClasses.js";

export const notFoundMiddleware = () => {
    throw new NotFoundError();
};
