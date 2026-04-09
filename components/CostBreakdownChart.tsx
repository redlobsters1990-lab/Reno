"use client";

import { PieChart, BarChart3 } from "lucide-react";

type Component = {
  category: string;
  material: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Kitchen": "#8b5cf6",
  "Bathroom": "#10b981",
  "Flooring": "#3b82f6",
  "Lighting": "#f59e0b",
  "Carpentry": "#ef4444",
  "Electrical": "#06b6d4",
  "Painting": "#84cc16",
  "Plumbing": "#f97316",
  "Windows & Doors": "#a855f7",
  "HVAC": "#64748b",
  "Tiling": "#14b8a6",
  "Wall Finishes": "#f43f5e",
  "Built‑In Furniture": "#0ea5e9",
  "Smart Home": "#6366f1",
  "Other": "#94a3b8",
};

export function CostBreakdownChart({ components }: { components: Component[] }) {
  if (!components || components.length === 0) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.02)",
        borderRadius: "12px",
        padding: "32px",
        border: "1px dashed rgba(255,255,255,0.1)",
        textAlign: "center",
        color: "#94a3b8",
      }}>
        <BarChart3 size={36} style={{ opacity: 0.5, marginBottom: "12px" }} />
        <p>No component data to display.</p>
      </div>
    );
  }

  const byCategory = components.reduce<Record<string, number>>((acc, comp) => {
    acc[comp.category] = (acc[comp.category] || 0) + comp.totalCost;
    return acc;
  }, {});

  const total = Object.values(byCategory).reduce((sum, val) => sum + val, 0);
  const sorted = Object.entries(byCategory)
    .map(([cat, val]) => ({ category: cat, value: val, percentage: (val / total) * 100 }))
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...sorted.map(item => item.value));

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      borderRadius: "12px",
      padding: "24px",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <PieChart style={{ marginRight: "10px", color: "#a78bfa" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Cost Breakdown</h3>
        <div style={{ marginLeft: "auto", fontSize: "14px", color: "#94a3b8" }}>
          Total: <span style={{ color: "white", fontWeight: 500 }}>${total.toLocaleString("en‑SG")}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {sorted.map((item) => (
          <div key={item.category}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "3px",
                  background: CATEGORY_COLORS[item.category] || "#94a3b8",
                }} />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{item.category}</span>
              </div>
              <div style={{ fontSize: "14px", color: "white", fontWeight: 500 }}>
                ${item.value.toLocaleString("en‑SG")}
                <span style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "8px" }}>
                  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div style={{
              height: "8px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "4px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${item.percentage}%`,
                background: CATEGORY_COLORS[item.category] || "#94a3b8",
                borderRadius: "4px",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
        marginTop: "24px",
        paddingTop: "20px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        {sorted.slice(0, 4).map(item => (
          <div key={item.category} style={{
            padding: "12px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "8px",
            border: `1px solid ${CATEGORY_COLORS[item.category]}40`,
          }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{item.category}</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "white" }}>
              ${item.value.toLocaleString("en‑SG")}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
              {item.percentage.toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}