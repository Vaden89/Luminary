import { supabaseAdmin } from "../config/supabase.js";

const NOMINATION_TABLE_NAME = "nominations";
const NOMINEE_TABLE_NAME = "nominee";

export const create = async (nominationData) => {
  try {
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
        evidence_urls: nominationData.evidence_urls,
        supporting_urls: nominationData.supporting_urls,
        description: nominationData.description,
      })
      .select()
      .single();

    if (nominationError) {
      await supabaseAdmin
        .from(NOMINEE_TABLE_NAME)
        .delete()
        .eq("id", nominee.id);
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

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
