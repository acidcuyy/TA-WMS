import { useState } from "react";
import "./LockedSelect.css";

/**
 * LockedSelect — dropdown dengan tombol kunci.
 * Ketika dikunci (🔒), dropdown tidak dapat diubah sampai dibuka kembali.
 *
 * Props:
 *   value        — nilai terpilih saat ini
 *   onChange     — callback saat nilai berubah (fn(e))
 *   options      — array of { value, label } ATAU array string
 *   className    — class tambahan untuk elemen <select>
 *   style        — inline style untuk wrapper
 *   placeholder  — opsi pertama (misal "Semua Status")
 *   [rest]       — props lain diteruskan ke <select>
 */
export default function LockedSelect({
  value,
  onChange,
  options = [],
  className = "",
  style = {},
  placeholder,
  children,
  ...rest
}) {
  const [locked, setLocked] = useState(false);

  const handleChange = (e) => {
    if (locked) return;
    if (onChange) onChange(e);
  };

  return (
    <div className="locked-select-wrapper" style={style}>
      <select
        className={`locked-select ${locked ? "locked-select--locked" : ""} ${className}`}
        value={value}
        onChange={handleChange}
        disabled={locked}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children
          ? children
          : options.map((opt) => {
              if (typeof opt === "string") {
                return <option key={opt} value={opt}>{opt}</option>;
              }
              return (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              );
            })}
      </select>
      <button
        type="button"
        className={`lock-btn ${locked ? "lock-btn--locked" : "lock-btn--unlocked"}`}
        onClick={() => setLocked((v) => !v)}
        title={locked ? "Klik untuk membuka kunci filter" : "Klik untuk mengunci filter"}
        aria-label={locked ? "Buka kunci dropdown" : "Kunci dropdown"}
      >
        {locked ? "🔒" : "🔓"}
      </button>
    </div>
  );
}
