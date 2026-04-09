"use client";

import { useState } from "react";
import {
  Building,
  Ruler,
  Palette,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  PieChart,
  Sparkles,
  Home,
  Bath,
  ChefHat,
  Sofa,
} from "lucide-react";
import { estimateCategories, materialOptions, unitOptions, categoryMaterialMap, categoryDefaultUnitMap, categoryUnitMap, heightOptions, heightMultipliers } from "@/lib/constants";

type Component = {
  category: (typeof estimateCategories)[number];
  material: (typeof materialOptions)[number];
  quantity: number;
  unit: (typeof unitOptions)[number];
  unitCost?: number;
  notes?: string;
  height?: (typeof heightOptions)[number];
};

type Room = {
  name: string;
  components: Component[];
};

type WizardData = {
  propertyType: string;
  styleTier: "budget" | "standard" | "premium";
  rooms: Room[];
};

const DEFAULT_ROOMS = [
  { name: "Living Room", icon: <Sofa className="w-4 h-4" /> },
  { name: "Kitchen", icon: <ChefHat className="w-4 h-4" /> },
  { name: "Master Bathroom", icon: <Bath className="w-4 h-4" /> },
  { name: "Bedroom 1", icon: <Home className="w-4 h-4" /> },
  { name: "Bedroom 2", icon: <Home className="w-4 h-4" /> },
];

export function EstimateWizard({ projectId, onComplete }: { projectId: string; onComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    propertyType: "HDB BTO",
    styleTier: "standard",
    rooms: DEFAULT_ROOMS.map(room => ({ name: room.name, components: [] })),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getHeightFromNotes = (notes?: string): "full" | "half" | undefined => {
    if (!notes) return undefined;
    const match = notes.match(/Height:\s*(full|half)/i);
    return match ? (match[1].toLowerCase() as "full" | "half") : undefined;
  };

  const setHeightToNotes = (notes?: string, height?: "full" | "half"): string => {
    let current = notes || "";
    // Remove existing height marker
    current = current.replace(/\s*Height:\s*(full|half)/gi, "").trim();
    if (height) {
      current = current ? `${current}, Height: ${height}` : `Height: ${height}`;
    }
    return current;
  };

  const addComponent = (roomIndex: number) => {
    const defaultCategory = estimateCategories[0]; // Kitchen Countertop
    const defaultMaterial = categoryMaterialMap[defaultCategory]?.[0] ?? materialOptions[0];
    const defaultUnit = categoryDefaultUnitMap[defaultCategory] ?? unitOptions[0];
    
    const updatedRooms = [...data.rooms];
    updatedRooms[roomIndex].components.push({
      category: defaultCategory,
      material: defaultMaterial,
      quantity: 1,
      unit: defaultUnit,
      unitCost: undefined,
      height: "full",
      notes: "",
    });
    setData({ ...data, rooms: updatedRooms });
  };

  const removeComponent = (roomIndex: number, compIndex: number) => {
    const updatedRooms = [...data.rooms];
    updatedRooms[roomIndex].components.splice(compIndex, 1);
    setData({ ...data, rooms: updatedRooms });
  };

  const updateComponent = (roomIndex: number, compIndex: number, field: keyof Component, value: any) => {
    const updatedRooms = [...data.rooms];
    const component = updatedRooms[roomIndex].components[compIndex];
    
    if (field === "category") {
      // Get allowed materials for the new category
      const allowedMaterials = categoryMaterialMap[value as keyof typeof categoryMaterialMap] ?? materialOptions;
      // Keep current material if it's allowed, otherwise pick first allowed
      const newMaterial = allowedMaterials.includes(component.material as string) ? component.material : allowedMaterials[0];
      // Get default unit for this category
      const defaultUnit = categoryDefaultUnitMap[value as keyof typeof categoryDefaultUnitMap] ?? unitOptions[0];
      
      updatedRooms[roomIndex].components[compIndex] = {
        ...component,
        category: value,
        material: newMaterial,
        unit: defaultUnit,
      };
    } else {
      updatedRooms[roomIndex].components[compIndex] = {
        ...component,
        [field]: value,
      };
    }
    setData({ ...data, rooms: updatedRooms });
  };

  const toggleRoom = (roomName: string) => {
    const exists = data.rooms.find(r => r.name === roomName);
    if (exists) {
      // Remove room
      setData({
        ...data,
        rooms: data.rooms.filter(r => r.name !== roomName),
      });
    } else {
      // Add room
      setData({
        ...data,
        rooms: [...data.rooms, { name: roomName, components: [] }],
      });
    }
  };

  const totalComponents = data.rooms.reduce((sum, room) => sum + room.components.length, 0);

  const handleSubmit = async () => {
    if (totalComponents === 0) {
      setError("Please add at least one component to generate an estimate.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const components = data.rooms.flatMap(room => room.components.map(comp => ({
        ...comp,
        unitCost: comp.unitCost || undefined,
      })));

      const payload = {
        projectId,
        propertyType: data.propertyType,
        styleTier: data.styleTier,
        kitchenRedo: false,
        bathroomCount: 0,
        carpentryLevel: "low",
        electricalScope: "basic",
        painting: false,
        budget: null,
        components,
        rooms: data.rooms,
      };

      console.log("Sending estimate payload:", payload);
      const res = await fetch("/api/estimates/enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // Ensure cookies are sent
      });

      if (!res.ok) {
        console.error("Estimate API error:", res.status, res.statusText);
        let errorMsg = `HTTP ${res.status}: ${res.statusText}`;
        try {
          const err = await res.json();
          errorMsg = err.error || err.message || errorMsg;
          console.error("Error response:", err);
        } catch (e) {
          // ignore
        }
        throw new Error(errorMsg);
      }

      const result = await res.json();
      console.log("Estimate created:", result);
      if (onComplete) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: "16px",
      padding: "24px",
      border: "1px solid rgba(255,255,255,0.1)",
      maxWidth: "800px",
      margin: "0 auto",
      color: "white",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
        <Sparkles style={{ marginRight: "12px", color: "#a78bfa" }} />
        <h2 style={{ fontSize: "20px", fontWeight: 600 }}>Renovation Cost Wizard</h2>
        <div style={{ marginLeft: "auto", fontSize: "14px", color: "#94a3b8" }}>
          Step {step} of 3
        </div>
      </div>

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "20px",
          color: "#f87171",
          fontSize: "14px",
        }}>
          {error}
        </div>
      )}

      {/* Step 1: Property & Style */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center" }}>
            <Building style={{ marginRight: "10px", color: "#a78bfa" }} size={20} />
            Property Basics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#cbd5e1", marginBottom: "8px" }}>Property Type</label>
              <select
                value={data.propertyType}
                onChange={(e) => setData({ ...data, propertyType: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="HDB BTO">HDB BTO</option>
                <option value="HDB Resale">HDB Resale</option>
                <option value="Condo">Condo</option>
                <option value="Landed">Landed</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", color: "#cbd5e1", marginBottom: "8px" }}>Style Tier</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {(["budget", "standard", "premium"] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setData({ ...data, styleTier: tier })}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: data.styleTier === tier ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${data.styleTier === tier ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "14px",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "30px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center" }}>
              <Home style={{ marginRight: "10px", color: "#a78bfa" }} size={20} />
              Select Rooms to Renovate
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
              {DEFAULT_ROOMS.map((room) => {
                const isSelected = data.rooms.some(r => r.name === room.name);
                return (
                  <button
                    key={room.name}
                    onClick={() => toggleRoom(room.name)}
                    style={{
                      padding: "16px 12px",
                      background: isSelected ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isSelected ? "#8b5cf6" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: "10px",
                      color: "white",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    {room.icon}
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{room.name}</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {isSelected ? "Selected" : "Click to add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Room Components */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center" }}>
            <Ruler style={{ marginRight: "10px", color: "#a78bfa" }} size={20} />
            Add Components for Each Room
          </h3>
          <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
            Specify materials, quantities, and estimated unit costs. Leave unit cost blank to use market averages.
          </p>

          {data.rooms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <Home size={40} style={{ opacity: 0.5, marginBottom: "16px" }} />
              <p>No rooms selected. Go back to Step 1 and select at least one room.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              {data.rooms.map((room, roomIndex) => (
                <div key={room.name} style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 600 }}>{room.name}</h4>
                    <button
                      onClick={() => addComponent(roomIndex)}
                      style={{
                        marginLeft: "auto",
                        background: "rgba(139,92,246,0.2)",
                        color: "#a78bfa",
                        border: "1px solid rgba(139,92,246,0.4)",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>

                  {room.components.length === 0 ? (
                    <div style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", padding: "20px" }}>
                      No components added yet. Click "Add Item" to start.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {room.components.map((comp, compIndex) => (
                        <div key={compIndex} style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr 1.5fr auto",
                          gap: "10px",
                          alignItems: "center",
                          padding: "12px",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}>
                          <select
                            value={comp.category}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "category", e.target.value)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          >
                            {estimateCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <select
                            value={comp.material}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "material", e.target.value)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          >
                            {categoryMaterialMap[comp.category]?.map(mat => <option key={mat} value={mat}>{mat}</option>) ?? materialOptions.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                          </select>
                          <input
                            type="number"
                            min="1"
                            value={comp.quantity}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "quantity", parseInt(e.target.value) || 1)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          />
                          <select
                            value={comp.unit}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "unit", e.target.value)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          >
                            {categoryUnitMap[comp.category]?.map(u => <option key={u} value={u}>{u}</option>) ?? unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Market"
                            value={comp.unitCost ?? ""}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "unitCost", e.target.value ? parseFloat(e.target.value) : undefined)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          />
                          <select
                            value={comp.height ?? "full"}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "height", e.target.value)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          >
                            {heightOptions.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <input
                            type="text"
                            placeholder="Specifications (optional)"
                            value={comp.notes ?? ""}
                            onChange={(e) => updateComponent(roomIndex, compIndex, "notes", e.target.value)}
                            style={{
                              padding: "8px 10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "6px",
                              color: "white",
                              fontSize: "13px",
                            }}
                          />
                          <button
                            onClick={() => removeComponent(roomIndex, compIndex)}
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#f87171",
                              border: "1px solid rgba(239,68,68,0.2)",
                              borderRadius: "6px",
                              padding: "8px 10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Generate */}
      {step === 3 && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center" }}>
            <CheckCircle style={{ marginRight: "10px", color: "#a78bfa" }} size={20} />
            Review & Generate Estimate
          </h3>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "24px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#cbd5e1" }}>Property Type</span>
              <span style={{ fontWeight: 500 }}>{data.propertyType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#cbd5e1" }}>Style Tier</span>
              <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{data.styleTier}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#cbd5e1" }}>Rooms Selected</span>
              <span style={{ fontWeight: 500 }}>{data.rooms.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#cbd5e1" }}>Total Components</span>
              <span style={{ fontWeight: 500 }}>{totalComponents}</span>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center" }}>
              <PieChart style={{ marginRight: "10px", color: "#a78bfa" }} size={18} />
              Estimated Cost Preview
            </h4>
            <div style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "10px",
              padding: "24px",
              textAlign: "center",
            }}>
              <DollarSign size={32} style={{ color: "#a78bfa", marginBottom: "12px" }} />
              <p style={{ fontSize: "14px", color: "#cbd5e1" }}>
                Your detailed estimate will be generated after you click "Generate Estimate".
                You'll receive a breakdown with low, realistic, and high ranges.
              </p>
              <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                Confidence: <span style={{ color: "#10b981" }}>High</span> (based on {totalComponents} detailed items)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <div></div>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            style={{
              padding: "10px 24px",
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "8px",
              color: "#a78bfa",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "auto",
            }}
          >
            Next Step
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || totalComponents === 0}
            style={{
              padding: "12px 28px",
              background: loading ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.4)",
              borderRadius: "8px",
              color: "#a78bfa",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading || totalComponents === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "auto",
              opacity: loading || totalComponents === 0 ? 0.6 : 1,
            }}
          >
            {loading ? "Generating..." : "Generate Estimate"}
            {!loading && <Sparkles size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}