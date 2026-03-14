import { supabaseAdmin } from "../config/supabase.js";

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
        evidence_urls: nominationData.evidence_urls,
        supporting_urls: nominationData.supporting_urls,
        description: nominationData.description,
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

export const getAll = async ({ search } = {}) => {
  try {
    let query = supabaseAdmin
      .from(NOMINATION_TABLE_NAME)
      .select(`*, nominee:${NOMINEE_TABLE_NAME}(*)`);

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

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
