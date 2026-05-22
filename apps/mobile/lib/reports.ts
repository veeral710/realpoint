import { supabase } from "./supabase";

export async function reportListing(
  listingId: string,
  reason: string,
  reporterId: string
) {
  return supabase.from("reports").insert({
    listing_id: listingId,
    reporter_id: reporterId,
    reason,
    status: "open",
  });
}

export async function reportNews(
  newsItemId: string,
  reason: string,
  reporterId: string
) {
  return supabase.from("reports").insert({
    news_item_id: newsItemId,
    reporter_id: reporterId,
    reason,
    status: "open",
  });
}
