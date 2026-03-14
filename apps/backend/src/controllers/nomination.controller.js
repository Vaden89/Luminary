import * as nominationService from "../services/nomination.service.js";
import { successResponse, paginatedResponse } from "../utils/apiResponse.js";

export const createNomination = async (req, res, next) => {
  try {
    const data = await nominationService.create(req.body);

    return successResponse(res, data, 201);
  } catch (error) {
    next(error);
  }
};

export const getNominations = async (req, res, next) => {
  try {
    const { search } = req.query;

    const data = await nominationService.getAll({ search });

    return successResponse(res, data);
  } catch (error) {
    next(error);
  }
};
