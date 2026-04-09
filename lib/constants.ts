export const propertyTypes = [
  "HDB BTO",
  "HDB Resale",
  "Condo",
  "Landed",
  "Studio",
  "Commercial",
] as const;

export const stylePreferences = [
  "Minimalist",
  "Scandinavian",
  "Modern Luxury",
  "Japandi",
  "Industrial",
  "Contemporary",
] as const;

export const estimateCategories = [
  "Kitchen Countertop",
  "Kitchen Cabinetry",
  "Kitchen Sink & Tap",
  "Kitchen Hob & Hood",
  "Kitchen Appliances",
  "Bathroom Vanity",
  "Bathroom Tiling",
  "Bathroom Fixtures",
  "Bathroom Shower Screen",
  "Flooring",
  "Lighting",
  "Carpentry",
  "Electrical Points",
  "Painting",
  "Plumbing",
  "Windows & Doors",
  "HVAC",
  "Wall Finishes",
  "Built‑In Furniture",
  "Smart Home",
  "Other",
] as const;

export const materialOptions = [
  // Countertop & Surface
  "Laminate",
  "Quartz",
  "Marble",
  "Granite",
  "Solid Wood",
  "Engineered Wood",
  "Concrete",
  "Glass",
  "Acrylic",
  "Stone",
  // Flooring
  "Vinyl",
  "Bamboo",
  "Ceramic Tile",
  "Porcelain Tile",
  "Mosaic",
  // Kitchen & Bathroom
  "Stainless Steel",
  "Ceramic",
  "Standard",
  "Premium",
  "Frameless",
  "Semi‑frameless",
  // Fixtures
  "Toilet",
  "Basin",
  "Shower Set",
  "Sink & Tap",
  "Hob & Hood",
  // Building Materials
  "Plywood",
  "Metal",
  "Fabric",
  // Finishes
  "Paint",
  "Wallpaper",
  "Feature Wall",
  "Cladding",
  // Electrical & Smart
  "LED",
  "Downlight",
  "Power Point",
  "Lighting Point",
  "Water Point",
  "Sanitary Point",
  "Smart Switch",
  "Sensor",
  // Appliances
  "Oven",
  "Fridge",
  "Air‑Con Unit",
  "Fan Coil",
  // Windows & Doors
  "Window",
  "Door",
  // Furniture
  "Wardrobe",
  "TV Console",
  // Other
  "Other",
] as const;

export const unitOptions = [
  // Area
  "sq ft", "sqm", "m²", "psf", "psm",
  // Linear
  "foot run", "linear meter", "lm", "m", "linear foot",
  // Count
  "each", "pc", "item", "set", "lot", "piece",
  // Time
  "man‑day", "day", "hour", "MD",
  // Volume
  "cubic meter", "m³",
  // Other
  "roll", "sheet", "panel", "length", "unit",
] as const;

export const fileTypes = ["floor_plan", "quote", "inspiration", "other"] as const;

export const quoteStatuses = ["draft", "parsed", "reviewed"] as const;

export const projectStatuses = ["active", "archived"] as const;
