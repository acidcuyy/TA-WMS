import React from "react";
import "./DateRangePicker.css";

export default function DateRangePicker({ defaultStart = "2026-02-01", defaultEnd = "2026-02-07" }) {
  return (
    <div className="date-range-wrap">
      <input 
        type="date" 
        className="date-range-input" 
        defaultValue={defaultStart}
        title="Tanggal Mulai"
      />
      <span className="date-range-sep">-</span>
      <input 
        type="date" 
        className="date-range-input" 
        defaultValue={defaultEnd}
        title="Tanggal Selesai"
      />
    </div>
  );
}
