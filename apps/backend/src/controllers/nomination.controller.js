import * as nominationService from "../services/nomination.service.js";
import { successResponse } from "../utils/apiResponse.js";

export const createNomination = async (req, res, next) => {
  try {
    const data = await nominationService.create(req.body);

    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
};
