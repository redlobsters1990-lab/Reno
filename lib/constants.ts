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
  "Sintered Stone",
  "Composite",
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
  "Induction",
  "Frameless",
  "Semi‑frameless",
  // Fixtures
  "Toilet",
  "Basin",
  "Shower Set",
  "Sink & Tap",
  "Hob & Hood",
  "Bidet",
  "Tap",
  "Mixer",
  // Building Materials
  "Plywood",
  "Metal",
  "Fabric",
  "Aluminium",
  "Melamine",
  "MDF",
  // Finishes
  "Paint",
  "Wallpaper",
  "Feature Wall",
  "Cladding",
  "Texture Coat",
  "Panelling",
  "Tile",
  "Wall Panel",
  // Electrical & Smart
  "LED",
  "Downlight",
  "Track Light",
  "Pendant",
  "Chandelier",
  "Spotlight",
  "Power Point",
  "Lighting Point",
  "Water Heater Point",
  "Data Point",
  "Switch",
  "Socket",
  "Dimmer",
  "Water Point",
  "Sanitary Point",
  "Drain Point",
  "Smart Switch",
  "Sensor",
  "Hub",
  "Camera",
  "Door Lock",
  "Smart Lock",
  "Thermostat",
  // Appliances
  "Oven",
  "Fridge",
  "Dishwasher",
  "Microwave",
  "Air‑Con Unit",
  "Fan Coil",
  "Condenser",
  // Windows & Doors
  "Window",
  "Door",
  "Sliding Door",
  "Bi‑fold",
  "French Door",
  "Grille",
  // Furniture
  "Wardrobe",
  "TV Console",
  "Shoe Cabinet",
  "Bookshelf",
  "Study Desk",
  "Kitchen Island",
  // Plumbing
  "Pipe",
  "Drain",
  "Valve",
  // HVAC
  "Duct",
  "Vent",
  // Other
  "Other",
] as const;

export const unitOptions = [
  // Area
  "sq ft", "sqm", "m²", "psf", "psm",
  // Linear
  "ft", "m",
  // Count
  "each", "pc", "item", "set", "lot", "piece",
  // Time
  "man‑day", "day", "hour", "MD",
  // Volume
  "cubic meter", "m³",
  // Other
  "roll", "sheet", "panel", "length", "unit",
] as const;

const categoryMaterialMapBase = {
  "Kitchen Countertop": ["Laminate", "Quartz", "Marble", "Granite", "Solid Wood", "Engineered Wood", "Concrete", "Glass", "Acrylic", "Stone", "Sintered Stone"] as const,
  "Kitchen Cabinetry": ["Laminate", "Solid Wood", "Plywood", "Engineered Wood", "Glass", "Acrylic"] as const,
  "Kitchen Sink & Tap": ["Stainless Steel", "Ceramic", "Composite"] as const,
  "Kitchen Hob & Hood": ["Standard", "Induction", "Premium"] as const,
  "Kitchen Appliances": ["Oven", "Fridge", "Dishwasher"] as const,
  "Bathroom Vanity": ["Laminate", "Solid Wood", "Acrylic"] as const,
  "Bathroom Tiling": ["Ceramic Tile", "Porcelain Tile", "Mosaic"] as const,
  "Bathroom Fixtures": ["Toilet", "Basin", "Shower Set", "Bidet"] as const,
  "Bathroom Shower Screen": ["Frameless", "Semi‑frameless"] as const,
  "Flooring": ["Vinyl", "Laminate", "Engineered Wood", "Ceramic Tile", "Porcelain Tile", "Marble"] as const,
  "Lighting": ["LED", "Downlight", "Track Light"] as const,
  "Carpentry": ["Plywood", "Solid Wood", "Engineered Wood", "Laminate", "Melamine", "MDF"] as const,
  "Electrical Points": ["Power Point", "Lighting Point", "Water Heater Point"] as const,
  "Painting": ["Paint", "Wallpaper"] as const,
  "Plumbing": ["Water Point", "Sanitary Point", "Drain Point"] as const,
  "Windows & Doors": ["Window", "Door", "Sliding Door"] as const,
  "HVAC": ["Air‑Con Unit", "Fan Coil", "Condenser"] as const,
  "Wall Finishes": ["Feature Wall", "Cladding", "Wall Panel"] as const,
  "Built‑In Furniture": ["Wardrobe", "TV Console", "Shoe Cabinet"] as const,
  "Smart Home": ["Smart Switch", "Sensor", "Smart Lock"] as const,
} as const;

export const categoryMaterialMap = (() => ({
  ...categoryMaterialMapBase,
  "Other": materialOptions,
} as const))();

export const categoryDefaultUnitMap = {
  "Kitchen Countertop": "ft",
  "Kitchen Cabinetry": "ft",
  "Kitchen Sink & Tap": "set",
  "Kitchen Hob & Hood": "set",
  "Kitchen Appliances": "piece",
  "Bathroom Vanity": "unit",
  "Bathroom Tiling": "sq ft",
  "Bathroom Fixtures": "piece",
  "Bathroom Shower Screen": "unit",
  "Flooring": "sq ft",
  "Lighting": "piece",
  "Carpentry": "ft",
  "Electrical Points": "piece",
  "Painting": "sq ft",
  "Plumbing": "piece",
  "Windows & Doors": "piece",
  "HVAC": "piece",
  "Wall Finishes": "sq ft",
  "Built‑In Furniture": "unit",
  "Smart Home": "piece",
  "Other": "piece",
} as const;

const categoryUnitMapBase = {
  "Kitchen Countertop": ["ft", "m"] as const,
  "Kitchen Cabinetry": ["ft", "m"] as const,
  "Kitchen Sink & Tap": ["set", "piece", "each"] as const,
  "Kitchen Hob & Hood": ["set", "piece"] as const,
  "Kitchen Appliances": ["piece", "each"] as const,
  "Bathroom Vanity": ["unit", "piece"] as const,
  "Bathroom Tiling": ["sq ft", "sqm", "m²"] as const,
  "Bathroom Fixtures": ["piece", "each"] as const,
  "Bathroom Shower Screen": ["unit", "piece"] as const,
  "Flooring": ["sq ft", "sqm", "m²"] as const,
  "Lighting": ["piece", "each"] as const,
  "Carpentry": ["ft", "m", "piece"] as const,
  "Electrical Points": ["piece", "each"] as const,
  "Painting": ["sq ft", "sqm", "m²"] as const,
  "Plumbing": ["piece", "each"] as const,
  "Windows & Doors": ["piece", "each"] as const,
  "HVAC": ["piece", "each"] as const,
  "Wall Finishes": ["sq ft", "sqm", "m²"] as const,
  "Built‑In Furniture": ["unit", "piece"] as const,
  "Smart Home": ["piece", "each"] as const,
} as const;

export const categoryUnitMap = (() => ({
  ...categoryUnitMapBase,
  "Other": unitOptions,
} as const))();

export const fileTypes = ["floor_plan", "quote", "inspiration", "other"] as const;

export const quoteStatuses = ["draft", "parsed", "reviewed"] as const;

export const projectStatuses = ["active", "archived"] as const;
