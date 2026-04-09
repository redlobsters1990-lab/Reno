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

export const categoryMaterialMap: Record<(typeof estimateCategories)[number], readonly (typeof materialOptions)[number][]> = {
  "Kitchen Countertop": ["Laminate", "Quartz", "Marble", "Granite", "Solid Wood", "Engineered Wood", "Concrete", "Glass", "Acrylic", "Stone"],
  "Kitchen Cabinetry": ["Laminate", "Solid Wood", "Plywood", "Engineered Wood", "Glass", "Acrylic"],
  "Kitchen Sink & Tap": ["Stainless Steel", "Ceramic", "Granite", "Stone"],
  "Kitchen Hob & Hood": ["Standard", "Premium", "Stainless Steel", "Glass"],
  "Kitchen Appliances": ["Oven", "Fridge", "Dishwasher", "Microwave"],
  "Bathroom Vanity": ["Laminate", "Solid Wood", "Plywood", "Marble", "Quartz", "Glass"],
  "Bathroom Tiling": ["Ceramic Tile", "Porcelain Tile", "Mosaic", "Stone", "Marble"],
  "Bathroom Fixtures": ["Toilet", "Basin", "Shower Set", "Bidet", "Tap", "Mixer"],
  "Bathroom Shower Screen": ["Frameless", "Semi‑frameless", "Glass", "Aluminium"],
  "Flooring": ["Vinyl", "Laminate", "Engineered Wood", "Ceramic Tile", "Porcelain Tile", "Bamboo", "Stone", "Marble"],
  "Lighting": ["LED", "Downlight", "Track Light", "Pendant", "Chandelier", "Spotlight"],
  "Carpentry": ["Plywood", "Solid Wood", "Engineered Wood", "Laminate", "Melamine", "MDF"],
  "Electrical Points": ["Power Point", "Lighting Point", "Data Point", "Switch", "Socket", "Dimmer"],
  "Painting": ["Paint", "Wallpaper", "Feature Wall", "Cladding", "Texture Coat"],
  "Plumbing": ["Water Point", "Sanitary Point", "Pipe", "Drain", "Valve", "Mixer"],
  "Windows & Doors": ["Window", "Door", "Sliding Door", "Bi‑fold", "French Door", "Grille"],
  "HVAC": ["Air‑Con Unit", "Fan Coil", "Condenser", "Duct", "Vent", "Thermostat"],
  "Wall Finishes": ["Feature Wall", "Cladding", "Panelling", "Wallpaper", "Tile", "Stone"],
  "Built‑In Furniture": ["Wardrobe", "TV Console", "Shoe Cabinet", "Bookshelf", "Study Desk", "Kitchen Island"],
  "Smart Home": ["Smart Switch", "Sensor", "Hub", "Camera", "Door Lock", "Thermostat"],
  "Other": materialOptions,
} as const;

export const categoryDefaultUnitMap: Record<(typeof estimateCategories)[number], (typeof unitOptions)[number]> = {
  "Kitchen Countertop": "foot run",
  "Kitchen Cabinetry": "linear foot",
  "Kitchen Sink & Tap": "set",
  "Kitchen Hob & Hood": "set",
  "Kitchen Appliances": "piece",
  "Bathroom Vanity": "unit",
  "Bathroom Tiling": "sq ft",
  "Bathroom Fixtures": "piece",
  "Bathroom Shower Screen": "unit",
  "Flooring": "sq ft",
  "Lighting": "piece",
  "Carpentry": "linear foot",
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

export const categoryUnitMap: Record<(typeof estimateCategories)[number], readonly (typeof unitOptions)[number][]> = {
  "Kitchen Countertop": ["foot run", "linear meter", "lm", "m", "linear foot"],
  "Kitchen Cabinetry": ["linear foot", "linear meter", "lm", "m"],
  "Kitchen Sink & Tap": ["set", "piece", "each"],
  "Kitchen Hob & Hood": ["set", "piece"],
  "Kitchen Appliances": ["piece", "each"],
  "Bathroom Vanity": ["unit", "piece"],
  "Bathroom Tiling": ["sq ft", "sqm", "m²"],
  "Bathroom Fixtures": ["piece", "each"],
  "Bathroom Shower Screen": ["unit", "piece"],
  "Flooring": ["sq ft", "sqm", "m²"],
  "Lighting": ["piece", "each"],
  "Carpentry": ["linear foot", "linear meter", "lm", "m", "piece"],
  "Electrical Points": ["piece", "each"],
  "Painting": ["sq ft", "sqm", "m²"],
  "Plumbing": ["piece", "each"],
  "Windows & Doors": ["piece", "each"],
  "HVAC": ["piece", "each"],
  "Wall Finishes": ["sq ft", "sqm", "m²"],
  "Built‑In Furniture": ["unit", "piece"],
  "Smart Home": ["piece", "each"],
  "Other": unitOptions,
} as const;

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
