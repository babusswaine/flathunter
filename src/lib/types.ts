export const PLATFORMS = [
  "dotproperty",
  "lamudi",
  "rentpad",
  "fb_marketplace",
  "fb_group",
  "airbnb",
  "idealista",
  "other",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PROPERTY_TYPES = ["condo", "apartment", "house", "studio"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const FURNISHING_OPTIONS = [
  "unfurnished",
  "semi_furnished",
  "fully_furnished",
] as const;
export type Furnishing = (typeof FURNISHING_OPTIONS)[number];

export const STATUSES = [
  "new",
  "interested",
  "contacted",
  "toured",
  "rejected",
  "extraction_failed",
] as const;
export type ListingStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<ListingStatus, string> = {
  new: "New",
  interested: "Interested",
  contacted: "Contacted",
  toured: "Toured",
  rejected: "Rejected",
  extraction_failed: "Extraction failed",
};

export interface Listing {
  id: string;
  source: {
    platform: Platform;
    url: string;
    captured_at: string;
  };
  title: string;
  property_type: PropertyType;
  location: {
    country: string;
    city: string;
    neighborhood: string;
    building_name: string | null;
    street: string | null;
  };
  bedrooms: number;
  bathrooms: number;
  size_sqm: number | null;
  floor_level: string | null;
  furnishing: Furnishing;
  photos: string[];
  price: {
    amount: number;
    currency: string;
    period: string;
    dues_included: boolean;
  };
  price_per_sqm: number | null;
  payment_terms: {
    deposit_months: number | null;
    advance_months: number | null;
    minimum_lease_months: number | null;
  };
  amenities: string[];
  rules: {
    pets_allowed: boolean | null;
  };
  contact: {
    name: string;
    verified: boolean;
  };
  user: {
    favorite: boolean;
    status: ListingStatus;
    notes: string | null;
  };
}

export type EditableUserFields = Partial<Listing["user"]>;
