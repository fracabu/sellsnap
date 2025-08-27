export interface Source {
  web: {
    uri: string;
    title: string;
  };
}

export interface GenerativePart {
    inlineData: {
        data: string;
        mimeType: string;
    };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: Source[];
}

export interface AppraisalResult {
  id: string;
  imageUrl: string;
  images?: string[]; // Array di tutte le immagini
  imageFiles?: File[]; // File originali per calcolo hash
  appraisalData: UniversalAppraisal;
  sources: Source[];
  chat?: {
    history: ChatMessage[];
    isLoading: boolean;
  };
  isDuplicateUpdate?: boolean; // Flag per aggiornamenti di duplicati
}

export interface UniversalAppraisal {
  locale: "it-IT";
  category: string;
  subcategory: string | null;
  title: string;
  description_bullets: string[];
  attributes: Attributes;
  condition: "NEW" | "LIKE_NEW" | "VERY_GOOD" | "GOOD" | "FAIR" | "FOR_PARTS";
  defects: string[];
  photos_needed: string[];
  missing_information: string[];
  authenticity_checks: AuthenticityChecks;
  pricing: Pricing;
  platform_fields: PlatformFields;
  category_specific: CategorySpecific;
  flags: Flags;
  confidence: number;
}

export interface Attributes {
  brand: string | null;
  model: string | null;
  maker_artist: string | null;
  era_period: string | null;
  color: string[];
  materials: string[];
  size: string | null;
  dimensions: string | null;
  weight: string | null;
  year: string | null;
  serial_ref: string | null;
}

export interface AuthenticityChecks {
  marks_labels: string[];
  serials_signatures: string[];
  notes: string | null;
  counterfeit_signals: string[];
}

export interface Pricing {
  currency: "EUR";
  mode: "web_based" | "heuristic_no_web";
  range_min: number;
  range_max: number;
  list_price_suggested: number;
  reasoning: string;
  comparables: Comparable[];
}

export interface Comparable {
  title: string;
  price: number;
  currency: "EUR";
  url: string;
  match_quality: "high" | "medium" | "low";
}

export interface PlatformFields {
  vinted: VintedPlatform;
  ebay: EbayPlatform;
  subito: SubitoPlatform;
}

export interface VintedPlatform {
  title: string;
  description: string;
  category: string;
  brand: string | null;
  size: string | null;
  condition: string;
  price: number;
}

export interface EbayPlatform {
  title: string;
  subtitle: string | null;
  category_id: string | null;
  condition_id: string | null;
  item_specifics: {
    Brand: string | null;
    Model: string | null;
    Color: string | null;
    Size: string | null;
    Material: string | null;
  };
  price: number;
}

export interface SubitoPlatform {
  title: string;
  description: string;
  category: string;
  price: number;
}

export interface CategorySpecific {
  furniture_antique?: FurnitureAntique;
  art?: Art;
  watches_jewelry?: WatchesJewelry;
  electronics_hifi?: ElectronicsHifi;
  fashion?: Fashion;
  books_records?: BooksRecords;
  tools?: Tools;
}

export interface FurnitureAntique {
  wood_species: string | null;
  finish_original: "unknown" | "yes" | "no";
  woodworm_signs: "unknown" | "yes" | "no";
  structural_issues: string[];
  restoration_history: string | null;
}

export interface Art {
  technique: string | null;
  support: string | null;
  signature: "unknown" | "yes" | "no";
  edition: string | null;
  provenance: string | null;
  certificate: "unknown" | "yes" | "no";
}

export interface WatchesJewelry {
  movement: string | null;
  case_material: string | null;
  gemstones: string[];
  service_history: string | null;
}

export interface ElectronicsHifi {
  power_on_test: "unknown" | "yes" | "no";
  accessories: string[];
  safety_concerns: string[];
}

export interface Fashion {
  fit_notes: string | null;
  measurements: {
    shoulder: string | null;
    chest: string | null;
    waist: string | null;
    length: string | null;
  };
  original_packaging: "unknown" | "yes" | "no";
}

export interface BooksRecords {
  edition_details: string | null;
  jacket_condition: string | null;
  media_surface: string | null;
}

export interface Tools {
  operational_test: "unknown" | "yes" | "no";
  consumables_wear: string[];
}


export interface Flags {
  restricted: boolean;
  counterfeit_risk: boolean;
  notes: string | null;
}