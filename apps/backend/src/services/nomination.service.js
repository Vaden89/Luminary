import { supabaseAdmin } from "../config/supabase.js";
import { NominationStatus } from "../lib/nominations.js";

const NOMINATION_TABLE_NAME = "nominations";
const NOMINEE_TABLE_NAME = "nominee";
const NOMINATOR_TABLE_NAME = "nominator";

export const create = async (nominationData) => {
  try {
    let nominatorId = null;

    if (!nominationData.is_self_submission) {
      const { data: nominator, error: nominatorError } = await supabaseAdmin
        .from(NOMINATOR_TABLE_NAME)
        .insert({
          first_name: nominationData.nominator_first_name,
          last_name: nominationData.nominator_last_name,
          email: nominationData.nominator_email,
          relationship_to_nominee: nominationData.relationship_to_nominee,
        })
        .select("id")
        .single();

      if (nominatorError) {
        throw createError(nominatorError.message, 400);
      }

      nominatorId = nominator.id;
    }

    const { data: nominee, error: nomineeError } = await supabaseAdmin
      .from(NOMINEE_TABLE_NAME)
      .insert({
        first_name: nominationData.nominee_first_name,
        last_name: nominationData.nominee_last_name,
        email: nominationData.nominee_email,
        country: nominationData.nominee_country,
        field: nominationData.nominee_field,
        organization: nominationData.nominee_organization,
      })
      .select("id")
      .single();

    if (nomineeError) {
      throw createError(nomineeError.message, 400);
    }

    const { data: nomination, error: nominationError } = await supabaseAdmin
      .from(NOMINATION_TABLE_NAME)
      .insert({
        nominee_id: nominee.id,
        nominator_id: nominatorId,
        status: NominationStatus.PENDING,
        description: nominationData.description,
        evidence_urls: nominationData.evidence_urls,
        supporting_urls: nominationData.supporting_urls,
      })
      .select()
      .single();

    if (nominationError) {
      await Promise.all([
        supabaseAdmin.from(NOMINEE_TABLE_NAME).delete().eq("id", nominee.id),
        nominatorId &&
          supabaseAdmin
            .from(NOMINATOR_TABLE_NAME)
            .delete()
            .eq("id", nominatorId),
      ]);
      throw createError(nominationError.message, 400);
    }

    return { ...nomination, nominee };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Critical Error in createNomination:", error);
    throw createError("Internal Server Error", 500);
  }
};

export const getById = async (id) => {
  try {
    const { data: nomination, error: nominationError } = await supabaseAdmin
      .from(NOMINATION_TABLE_NAME)
      .select(
        `*, nominee:${NOMINEE_TABLE_NAME}(*), nominator:${NOMINATOR_TABLE_NAME}(*)`,
      )
      .eq("id", id)
      .single();

    if (nominationError) {
      throw createError(nominationError.message, 404);
    }

    const { nominator_id, nominee_id, ...nominationData } = nomination;

    return { ...nominationData };
  } catch (error) {
    console.log(error);

    if (error.statusCode) {
      throw error;
    }

    throw createError("Internal Server Error", 500);
  }
};

export const getAll = async ({ search } = {}) => {
  try {
    let query = supabaseAdmin
      .from(NOMINATION_TABLE_NAME)
      .select(`*, nominee:${NOMINEE_TABLE_NAME}(*)`)
      .eq("status", NominationStatus.APPROVED);

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
        { referencedTable: NOMINEE_TABLE_NAME },
      );
    }

    const { data: nominations, error } = await query;

    if (error) {
      throw createError(error.message, 400);
    }

    return nominations;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Critical Error in getNominations:", error);
    throw createError("Internal Server Error", 500);
  }
};

export const adminGetAll = async ({ search } = {}) => {
  try {
    let query = supabaseAdmin
      .from(NOMINATION_TABLE_NAME)
      .select(
        `*, nominee:${NOMINEE_TABLE_NAME}(*), nominator:${NOMINATOR_TABLE_NAME}(*)`,
      );

    if (search) {
      console.log(search);
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
        { referencedTable: NOMINEE_TABLE_NAME },
      );
    }

    const { data: nominations, error } = await query;

    if (error) {
      throw createError(error.message, 400);
    }

    return nominations;
  } catch (error) {
    throw error;
  }
};

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
