import { motion, AnimatePresence } from "framer-motion";
import "./DetailModal.css";

/**
 * Reusable component for showing details of a transaction/request.
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Closes the modal
 * @param {string} title - Main title (e.g. "Detail Penerimaan")
 * @param {string} subtitle - Subtitle below the title
 * @param {Array} details - Array of objects { label: string, value: string|ReactNode, color: string }
 * @param {string} itemsTitle - Title for the items list
 * @param {Array} items - Array of strings or objects { text: string }
 * @param {string} totalLabel - Label for the bottom total section
 * @param {string|ReactNode} totalValue - Value for the bottom total section
 */
export default function DetailModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  details = [], 
  itemsTitle = "Daftar Barang", 
  items = [], 
  totalLabel = "Total Estimasi Nilai", 
  totalValue 
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="reastock__overlay" onClick={onClose}>
        <motion.div 
          className="reastock__modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="reastock__modalHead">
            <div>
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </div>
            <button className="reastock__closeBtn" onClick={onClose}>×</button>
          </div>
          <div className="reastock__modalBody">
            {details && details.length > 0 && (
              <div className="reastock__modalGrid">
                {details.map((dt, idx) => (
                  <div key={idx}>
                    <span className="reastock__modalLabel">{dt.label}</span>
                    <div className="reastock__modalValue" style={{ color: dt.color || 'var(--text)' }}>
                      {dt.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items && items.length > 0 && (
              <>
                <h4 className="reastock__modalItemsTitle">{itemsTitle}</h4>
                <ul className="reastock__modalItemsList">
                  {items.map((it, idx) => {
                    const text = typeof it === 'string' ? it : it.text;
                    return (
                      <li key={idx}>
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            
            {totalValue !== undefined && totalValue !== null && (
              <div className="reastock__modalFooter">
                <span className="reastock__modalFooterLabel">{totalLabel}</span>
                <span className="reastock__modalFooterValue">{totalValue}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
