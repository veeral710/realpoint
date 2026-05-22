import { supabase } from "@/lib/supabase";

export type DocumentRequestType = "seven_twelve" | "property_card";

export function makeDemoReferenceCode(): string {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `DEMO-${suffix}`;
}

export async function submitDocumentRequest(input: {
  userId: string;
  requestType: DocumentRequestType;
  surveyNumber?: string;
  villageName?: string;
  contactPhone?: string;
  notes?: string;
  listingId?: string;
  tpSchemeId?: string;
}) {
  const reference_code = makeDemoReferenceCode();
  const { data, error } = await supabase
    .from("document_requests")
    .insert({
      user_id: input.userId,
      request_type: input.requestType,
      survey_number: input.surveyNumber?.trim() || null,
      village_name: input.villageName?.trim() || null,
      contact_phone: input.contactPhone?.trim() || null,
      notes: input.notes?.trim() || null,
      listing_id: input.listingId ?? null,
      tp_scheme_id: input.tpSchemeId ?? null,
      reference_code,
      is_demo: true,
      status: "submitted",
    })
    .select("reference_code")
    .single();

  return { reference_code: data?.reference_code ?? reference_code, error };
}
