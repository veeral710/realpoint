import { z } from "zod";
import {
  AREA_UNITS,
  LISTING_INTENTS,
  NEWS_CATEGORIES,
  PROPERTY_CLASSES,
  USER_ROLES,
} from "./constants";

export const userRoleSchema = z.enum(USER_ROLES);
export const newsCategorySchema = z.enum(NEWS_CATEGORIES);
export const listingIntentSchema = z.enum(LISTING_INTENTS);
export const propertyClassSchema = z.enum(PROPERTY_CLASSES);
export const areaUnitSchema = z.enum(AREA_UNITS);

export const profileSchema = z.object({
  id: z.string().uuid(),
  phone: z.string().nullable(),
  full_name: z.string().nullable(),
  role: userRoleSchema,
  disclaimer_accepted_at: z.string().nullable(),
  is_admin: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const localitySchema = z.object({
  id: z.string().uuid(),
  district: z.string(),
  taluka: z.string().nullable(),
  area_name: z.string(),
  area_name_gu: z.string().nullable(),
  sort_order: z.number(),
});

export const newsItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  title_gu: z.string().nullable(),
  summary: z.string().min(1),
  summary_gu: z.string().nullable(),
  category: newsCategorySchema,
  source_url: z.string().url().nullable(),
  pdf_url: z.string().url().nullable(),
  published_at: z.string(),
  is_published: z.boolean(),
  created_at: z.string(),
});

export const createNewsItemSchema = z.object({
  title: z.string().min(1).max(200),
  title_gu: z.string().max(200).optional(),
  summary: z.string().min(1).max(2000),
  summary_gu: z.string().max(2000).optional(),
  category: newsCategorySchema,
  source_url: z.string().url().optional().or(z.literal("")),
  pdf_url: z.string().url().optional().or(z.literal("")),
  published_at: z.string(),
  is_published: z.boolean().default(true),
});

export const listingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  intent: listingIntentSchema,
  property_class: propertyClassSchema,
  title: z.string(),
  description: z.string().nullable(),
  price: z.number().nullable(),
  price_negotiable: z.boolean(),
  area_value: z.number().nullable(),
  area_unit: areaUnitSchema.nullable(),
  locality_id: z.string().uuid().nullable(),
  address_text: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  na_status: z.string().nullable(),
  road_width_ft: z.number().nullable(),
  zone_name: z.string().nullable(),
  survey_number: z.string().nullable(),
  bhk: z.number().nullable(),
  floor_number: z.number().nullable(),
  furnishing: z.string().nullable(),
  building_age_years: z.number().nullable(),
  parking: z.boolean().nullable(),
  contact_phone: z.string().nullable(),
  contact_whatsapp: z.string().nullable(),
  status: z.enum(["draft", "published", "archived", "reported"]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createListingSchema = z.object({
  intent: listingIntentSchema,
  property_class: propertyClassSchema,
  title: z.string().min(3).max(120),
  description: z.string().max(5000).optional(),
  price: z.number().positive().optional(),
  price_negotiable: z.boolean().default(true),
  area_value: z.number().positive().optional(),
  area_unit: areaUnitSchema.optional(),
  locality_id: z.string().uuid().optional(),
  address_text: z.string().max(500).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  na_status: z.string().max(100).optional(),
  road_width_ft: z.number().positive().optional(),
  zone_name: z.string().max(100).optional(),
  survey_number: z.string().max(50).optional(),
  bhk: z.number().int().min(1).max(20).optional(),
  floor_number: z.number().int().optional(),
  furnishing: z.string().max(50).optional(),
  building_age_years: z.number().int().min(0).optional(),
  parking: z.boolean().optional(),
  contact_phone: z.string().optional(),
  contact_whatsapp: z.string().optional(),
});

export const listingInquirySchema = z.object({
  listing_id: z.string().uuid(),
  message: z.string().min(1).max(1000),
  contact_phone: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Locality = z.infer<typeof localitySchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
export type Listing = z.infer<typeof listingSchema>;
export type CreateListing = z.infer<typeof createListingSchema>;
export type CreateNewsItem = z.infer<typeof createNewsItemSchema>;
