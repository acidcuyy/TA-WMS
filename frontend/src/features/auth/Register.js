import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Register.css";

import logo from "../../assets/images/logo.png";
import SplitText from "../../components/animations/SplitText";

export default function Register() {
  const nav = useNavigate();
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);
  const termsContentRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);

  // Modal control for Step 5 Onboarding
  const [activeModal, setActiveModal] = useState(null);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    // Step 1: Data Perusahaan (Mandatory & Optional)
    companyName: "",
    companyBrand: "", // Optional
    companyIndustry: "", // Retail, Distributor, Manufacturing
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyCity: "",
    companyZip: "", // Optional
    
    // Step 2: Data Owner (Mandatory)
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerTitle: "", // Owner / Direktur / Manager Operasional
    ownerPassword: "",
    ownerConfirmPassword: "",
    ownerRole: "Owner", // Auto-filled

    // Step 3: Setup Operasional Awal
    setupWarehousesCount: "1",
    setupStoresCount: "1",
    setupCurrency: "IDR",
    setupTimezone: "WIB",
    
    // Step 3: Data Bisnis Tambahan (Optional)
    optTaxId: "", // NPWP Perusahaan
    optNib: "", // NIB / Izin Usaha
    optWebsite: "",
    optLogo: "", // Mock Logo URL or input
    optEmployeeCount: "",
    optMainCategory: "",
    optSkuEstimate: "",
    optMonthlyTx: "",
    
    acceptTerms: false,
  });

  // Step 5 Onboarding Setup Task Completion Tracker
  const [onboardingTasks, setOnboardingTasks] = useState({
    warehouse: false,
    store: false,
    category: false,
    product: false,
    gudangUser: false,
    tokoUser: false,
    minStock: false,
    theme: false,
    notification: false,
  });

  // Onboarding Setup Data
  const [onboardingData, setOnboardingData] = useState({
    warehouseName: "",
    warehouseAddress: "",
    warehouseType: "General",
    storeName: "",
    storeAddress: "",
    storePhone: "",
    productCategory: "",
    productCategoryDesc: "",
    productName: "",
    productSku: "",
    productPrice: "",
    productStock: "",
    gudangStaffName: "",
    gudangStaffEmail: "",
    gudangStaffRole: "Admin Gudang",
    tokoStaffName: "",
    tokoStaffEmail: "",
    tokoStaffRole: "Kasir",
    minStockLevel: "10",
    minStockAlert: "High",
    selectedTheme: "orange", // orange, blue, dark, light
    notifEmail: true,
    notifWhatsApp: true,
    notifSystem: true,
  });

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle onboarding input changes
  const handleOnboardingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOnboardingData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Monitor terms container scrolling to enable checkbox
  const handleTermsScroll = () => {
    const container = termsContentRef.current;
    if (!container) return;
    
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 15;
    if (isAtBottom && !hasScrolledTerms) {
      setHasScrolledTerms(true);
    }
  };

  // Enable Terms scroll check if container is small or not scrollable
  useEffect(() => {
    if (step === 4 && termsContentRef.current) {
      const container = termsContentRef.current;
      const isScrollable = container.scrollHeight > container.clientHeight;
      if (!isScrollable) {
        setHasScrolledTerms(true);
      }
    }
  }, [step]);

  // Client-side validations per step
  const validateStep = (currentStep) => {
    const stepErrors = {};
    
    if (currentStep === 1) {
      // Step 1: Data Perusahaan
      if (!formData.companyName.trim()) {
        stepErrors.companyName = "Nama Perusahaan wajib diisi.";
      }
      if (!formData.companyIndustry) {
        stepErrors.companyIndustry = "Jenis Bisnis wajib dipilih.";
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.companyEmail.trim()) {
        stepErrors.companyEmail = "Email Perusahaan wajib diisi.";
      } else if (!emailRegex.test(formData.companyEmail)) {
        stepErrors.companyEmail = "Format email tidak valid.";
      }

      const phoneRegex = /^[0-9+() -]{8,15}$/;
      if (!formData.companyPhone.trim()) {
        stepErrors.companyPhone = "Nomor Telepon Perusahaan wajib diisi.";
      } else if (!phoneRegex.test(formData.companyPhone)) {
        stepErrors.companyPhone = "Gunakan nomor telepon yang valid.";
      }

      if (!formData.companyAddress.trim()) {
        stepErrors.companyAddress = "Alamat Perusahaan wajib diisi.";
      } else if (formData.companyAddress.trim().length < 8) {
        stepErrors.companyAddress = "Alamat minimal 8 karakter.";
      }

      if (!formData.companyCity.trim()) {
        stepErrors.companyCity = "Kota / Provinsi wajib diisi.";
      }
    } 
    
    else if (currentStep === 2) {
      // Step 2: Data Owner
      if (!formData.ownerName.trim()) {
        stepErrors.ownerName = "Nama Lengkap Owner wajib diisi.";
      } else if (formData.ownerName.trim().length < 3) {
        stepErrors.ownerName = "Nama Lengkap minimal 3 karakter.";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.ownerEmail.trim()) {
        stepErrors.ownerEmail = "Email Owner wajib diisi.";
      } else if (!emailRegex.test(formData.ownerEmail)) {
        stepErrors.ownerEmail = "Format email tidak valid.";
      }

      const phoneRegex = /^(08|\+62|62)[0-9]{8,13}$/;
      if (!formData.ownerPhone.trim()) {
        stepErrors.ownerPhone = "Nomor HP Owner wajib diisi.";
      } else if (!phoneRegex.test(formData.ownerPhone)) {
        stepErrors.ownerPhone = "Gunakan format Indonesia yang valid (contoh: 081234567890).";
      }

      if (!formData.ownerTitle) {
        stepErrors.ownerTitle = "Jabatan wajib dipilih.";
      }

      if (!formData.ownerPassword) {
        stepErrors.ownerPassword = "Kata sandi wajib diisi.";
      } else if (formData.ownerPassword.length < 8) {
        stepErrors.ownerPassword = "Kata sandi minimal harus 8 karakter.";
      }

      if (formData.ownerPassword !== formData.ownerConfirmPassword) {
        stepErrors.ownerConfirmPassword = "Konfirmasi kata sandi tidak cocok.";
      }
    } 
    
    else if (currentStep === 3) {
      // Step 3: Setup Operasional Awal (Optional validations if entered)
      if (formData.optTaxId && !/^[0-9]{15,16}$/.test(formData.optTaxId.trim())) {
        stepErrors.optTaxId = "NPWP harus berisi 15 atau 16 digit angka.";
      }
      if (formData.optNib && !/^[0-9]{13,16}$/.test(formData.optNib.trim())) {
        stepErrors.optNib = "NIB harus berisi 13-16 digit angka.";
      }
    } 
    
    else if (currentStep === 4) {
      // Step 4: Konfirmasi & Persetujuan
      if (!formData.acceptTerms) {
        stepErrors.acceptTerms = "Anda harus menyetujui Syarat & Ketentuan untuk menyelesaikan pendaftaran.";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setErrors({});
      setStep(step - 1);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      setStep(5);
    }
  };

  // Finish Onboarding and enter dashboard
  const handleOnboardingComplete = () => {
    const completedCount = Object.values(onboardingTasks).filter(Boolean).length;
    if (completedCount === 0) {
      if (window.confirm("Anda belum melakukan konfigurasi awal. Yakin ingin masuk langsung ke dashboard?")) {
        goLogin();
      }
    } else {
      goLogin();
    }
  };

  // Complete specific onboarding task
  const saveOnboardingTask = (taskKey) => {
    setOnboardingTasks(prev => ({ ...prev, [taskKey]: true }));
    setActiveModal(null);
  };

  const goLogin = () => {
    setIsLeaving(true);
    setTimeout(() => {
      nav("/login");
    }, 420);
  };

  const stepProgress = Object.values(onboardingTasks).filter(Boolean).length;
  const progressPercent = Math.round((stepProgress / 9) * 100);

  // Transitions
  const variants = {
    initial: { x: 50, opacity: 0, scale: 0.98 },
    animate: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: easing } },
    exit: { x: -50, opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: easing } },
  };

  // Steps indicator for side panel (Step 1-4)
  const stepsList = [
    { num: 1, label: "Data Perusahaan", desc: "Profil badan usaha" },
    { num: 2, label: "Data Owner", desc: "Informasi pemilik & sandi" },
    { num: 3, label: "Setup Awal & Opsional", desc: "Konfigurasi tenant & legal" },
    { num: 4, label: "Konfirmasi", desc: "Syarat & Tinjauan akhir" }
  ];

  return (
    <motion.div
      className="reastock-register-container"
      initial={{ opacity: 1 }}
      animate={{
        opacity: isLeaving ? 0 : 1,
        filter: isLeaving ? "blur(8px)" : "blur(0px)",
      }}
      transition={{ duration: 0.42, ease: easing }}
    >
      {/* Background gradients */}
      <div className="bg-blur-blob blob-1"></div>
      <div className="bg-blur-blob blob-2"></div>
      <div className="bg-blur-blob blob-3"></div>

      <motion.div
        className={`register-card ${step === 5 ? "register-card-full" : ""}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: easing }}
      >
        {/* Left Progress Bar Panel - Hidden in Step 5 for full width onboarding */}
        {step < 5 && (
          <div className="register-left">
            <div className="reg-brand">
              <img src={logo} alt="ReaStock" className="reg-logo" />
              <SplitText
                tag="h1"
                text="Join ReaStock"
                className="reg-brand-title"
                delay={120}
                from={{ opacity: 0, y: 15 }}
                to={{ opacity: 1, y: 0 }}
                ease="back.out(2)"
                threshold={0.1}
                textAlign="left"
              />
              <p className="reg-brand-desc">
                Pusatkan pengelolaan inventaris gudang, distribusi ritel, dan tracking armada dalam satu platform.
              </p>
            </div>
            
            <div className="step-progress-vertical">
              {stepsList.map((s) => {
                const isCompleted = step > s.num;
                const isActive = step === s.num;
                return (
                  <div key={s.num} className={`step-item-vertical ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}>
                    <div className="step-icon-circle">
                      {isCompleted ? (
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        s.num
                      )}
                    </div>
                    <div className="step-label-group">
                      <span className="step-label-title">{s.label}</span>
                      <span className="step-label-desc">{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="reg-left-footer">
              <span>© 2026 ReaStock WMS System.</span>
            </div>
          </div>
        )}

        {/* Right Form Workspace */}
        <div className="register-right">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Data Perusahaan */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 1 dari 4</span>
                  <h2>Informasi Perusahaan (Tenant)</h2>
                  <p className="step-subtitle">Lengkapi profil badan usaha perusahaan Anda untuk alokasi ruang kerja di sistem.</p>
                </div>

                <div className="form-grid">
                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Nama Perusahaan *</label>
                      <input
                        type="text"
                        name="companyName"
                        placeholder="Contoh: PT Sejahtera Makmur"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={`reg-input ${errors.companyName ? "input-error" : ""}`}
                      />
                      {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Nama Brand / Toko</label>
                      <input
                        type="text"
                        name="companyBrand"
                        placeholder="Contoh: Sejahtera Mart (Opsional)"
                        value={formData.companyBrand}
                        onChange={handleChange}
                        className="reg-input"
                      />
                    </div>
                  </div>

                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Jenis Bisnis *</label>
                      <select
                        name="companyIndustry"
                        value={formData.companyIndustry}
                        onChange={handleChange}
                        className={`reg-input reg-select ${errors.companyIndustry ? "input-error" : ""}`}
                      >
                        <option value="">-- Pilih Jenis --</option>
                        <option value="Retail">Retail (Dagang Eceran)</option>
                        <option value="Distributor">Distributor / Grosir</option>
                        <option value="Manufacturing">Manufaktur / Pabrikasi</option>
                      </select>
                      {errors.companyIndustry && <span className="error-text">{errors.companyIndustry}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Email Perusahaan *</label>
                      <input
                        type="email"
                        name="companyEmail"
                        placeholder="Contoh: admin@sejahtera.com"
                        value={formData.companyEmail}
                        onChange={handleChange}
                        className={`reg-input ${errors.companyEmail ? "input-error" : ""}`}
                      />
                      {errors.companyEmail && <span className="error-text">{errors.companyEmail}</span>}
                    </div>
                  </div>

                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Nomor Telepon Perusahaan *</label>
                      <input
                        type="text"
                        name="companyPhone"
                        placeholder="Contoh: 021-889988 / 0812xxxx"
                        value={formData.companyPhone}
                        onChange={handleChange}
                        className={`reg-input ${errors.companyPhone ? "input-error" : ""}`}
                      />
                      {errors.companyPhone && <span className="error-text">{errors.companyPhone}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Kota / Provinsi *</label>
                      <input
                        type="text"
                        name="companyCity"
                        placeholder="Contoh: Surabaya, Jawa Timur"
                        value={formData.companyCity}
                        onChange={handleChange}
                        className={`reg-input ${errors.companyCity ? "input-error" : ""}`}
                      />
                      {errors.companyCity && <span className="error-text">{errors.companyCity}</span>}
                    </div>
                  </div>

                  <div className="input-double-row" style={{ gridTemplateColumns: "2.5fr 1fr" }}>
                    <div className="input-group">
                      <label className="input-label">Alamat Lengkap Perusahaan *</label>
                      <input
                        type="text"
                        name="companyAddress"
                        placeholder="Contoh: Jl. Merdeka No. 10"
                        value={formData.companyAddress}
                        onChange={handleChange}
                        className={`reg-input ${errors.companyAddress ? "input-error" : ""}`}
                      />
                      {errors.companyAddress && <span className="error-text">{errors.companyAddress}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Kode Pos</label>
                      <input
                        type="text"
                        name="companyZip"
                        placeholder="602xx"
                        value={formData.companyZip}
                        onChange={handleChange}
                        className="reg-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={goLogin}>
                    Kembali ke Login
                  </button>
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Lanjut
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Data Owner */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 2 dari 4</span>
                  <h2>Data Pemilik Perusahaan (Owner)</h2>
                  <p className="step-subtitle">Buat akun orang pertama yang akan memegang akses Super Admin di sistem.</p>
                </div>

                <div className="form-grid">
                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Nama Lengkap Owner *</label>
                      <input
                        type="text"
                        name="ownerName"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.ownerName}
                        onChange={handleChange}
                        className={`reg-input ${errors.ownerName ? "input-error" : ""}`}
                      />
                      {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Email Login Owner *</label>
                      <input
                        type="email"
                        name="ownerEmail"
                        placeholder="Contoh: budi@email.com"
                        value={formData.ownerEmail}
                        onChange={handleChange}
                        className={`reg-input ${errors.ownerEmail ? "input-error" : ""}`}
                      />
                      {errors.ownerEmail && <span className="error-text">{errors.ownerEmail}</span>}
                    </div>
                  </div>

                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Nomor HP / WhatsApp Owner *</label>
                      <input
                        type="text"
                        name="ownerPhone"
                        placeholder="Contoh: 0812xxxxxxxx"
                        value={formData.ownerPhone}
                        onChange={handleChange}
                        className={`reg-input ${errors.ownerPhone ? "input-error" : ""}`}
                      />
                      {errors.ownerPhone && <span className="error-text">{errors.ownerPhone}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Jabatan di Perusahaan *</label>
                      <select
                        name="ownerTitle"
                        value={formData.ownerTitle}
                        onChange={handleChange}
                        className={`reg-input reg-select ${errors.ownerTitle ? "input-error" : ""}`}
                      >
                        <option value="">-- Pilih Jabatan --</option>
                        <option value="Owner">Owner (Pemilik)</option>
                        <option value="Direktur">Direktur</option>
                        <option value="Manager Operasional">Manager Operasional</option>
                      </select>
                      {errors.ownerTitle && <span className="error-text">{errors.ownerTitle}</span>}
                    </div>
                  </div>

                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Kata Sandi Login *</label>
                      <input
                        type="password"
                        name="ownerPassword"
                        placeholder="Minimal 8 karakter"
                        value={formData.ownerPassword}
                        onChange={handleChange}
                        className={`reg-input ${errors.ownerPassword ? "input-error" : ""}`}
                      />
                      {errors.ownerPassword && <span className="error-text">{errors.ownerPassword}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Konfirmasi Kata Sandi *</label>
                      <input
                        type="password"
                        name="ownerConfirmPassword"
                        placeholder="Ulangi kata sandi"
                        value={formData.ownerConfirmPassword}
                        onChange={handleChange}
                        className={`reg-input ${errors.ownerConfirmPassword ? "input-error" : ""}`}
                      />
                      {errors.ownerConfirmPassword && <span className="error-text">{errors.ownerConfirmPassword}</span>}
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    Kembali
                  </button>
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Lanjut
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Setup Operasional Awal & Data Opsional */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 3 dari 4</span>
                  <h2>Setup Operasional & Data Opsional</h2>
                  <p className="step-subtitle">Konfigurasikan setelan dasar gudang serta lengkapi data legalitas tambahan (opsional).</p>
                </div>

                <div className="setup-scroll-wrapper">
                  {/* Setup Operasional Wajib */}
                  <div className="setup-section-card">
                    <h3 className="section-title-sub">⚙️ Setelan Operasional (Awal)</h3>
                    <div className="input-double-row">
                      <div className="input-group">
                        <label className="input-label">Jumlah Gudang Utama *</label>
                        <select name="setupWarehousesCount" value={formData.setupWarehousesCount} onChange={handleChange} className="reg-input reg-select">
                          <option value="1">1 Gudang</option>
                          <option value="2">2 Gudang</option>
                          <option value="5+">5+ Gudang</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Jumlah Toko / Cabang *</label>
                        <select name="setupStoresCount" value={formData.setupStoresCount} onChange={handleChange} className="reg-input reg-select">
                          <option value="1">1 Toko</option>
                          <option value="3">3 Toko</option>
                          <option value="10+">10+ Toko / Cabang</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-double-row" style={{ marginTop: "10px" }}>
                      <div className="input-group">
                        <label className="input-label">Mata Uang Utama *</label>
                        <select name="setupCurrency" value={formData.setupCurrency} onChange={handleChange} className="reg-input reg-select">
                          <option value="IDR">Rupiah (IDR)</option>
                          <option value="USD">Dolar AS (USD)</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Zona Waktu Operasional *</label>
                        <select name="setupTimezone" value={formData.setupTimezone} onChange={handleChange} className="reg-input reg-select">
                          <option value="WIB">WIB (GMT+7)</option>
                          <option value="WITA">WITA (GMT+8)</option>
                          <option value="WIT">WIT (GMT+9)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Data Opsional Tambahan (Collapsible atau scrollable card) */}
                  <div className="setup-section-card optional-section">
                    <h3 className="section-title-sub">📄 Data Bisnis Tambahan (Opsional)</h3>
                    <p className="section-desc-sub">Melengkapi data di bawah membantu kami menyesuaikan performa server & profil tagihan.</p>
                    
                    <div className="input-double-row">
                      <div className="input-group">
                        <label className="input-label">Nomor NPWP Perusahaan</label>
                        <input
                          type="text"
                          name="optTaxId"
                          placeholder="15-16 digit angka"
                          maxLength={16}
                          value={formData.optTaxId}
                          onChange={handleChange}
                          className={`reg-input ${errors.optTaxId ? "input-error" : ""}`}
                        />
                        {errors.optTaxId && <span className="error-text">{errors.optTaxId}</span>}
                      </div>

                      <div className="input-group">
                        <label className="input-label">NIB / Nomor Izin Usaha</label>
                        <input
                          type="text"
                          name="optNib"
                          placeholder="Angka izin operasional"
                          maxLength={16}
                          value={formData.optNib}
                          onChange={handleChange}
                          className={`reg-input ${errors.optNib ? "input-error" : ""}`}
                        />
                        {errors.optNib && <span className="error-text">{errors.optNib}</span>}
                      </div>
                    </div>

                    <div className="input-double-row" style={{ marginTop: "10px" }}>
                      <div className="input-group">
                        <label className="input-label">Website Resmi Perusahaan</label>
                        <input
                          type="text"
                          name="optWebsite"
                          placeholder="Contoh: www.sejahtera.com"
                          value={formData.optWebsite}
                          onChange={handleChange}
                          className="reg-input"
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">URL / Unggah Logo Brand</label>
                        <input
                          type="text"
                          name="optLogo"
                          placeholder="Contoh: Link URL / File logo"
                          value={formData.optLogo}
                          onChange={handleChange}
                          className="reg-input"
                        />
                      </div>
                    </div>

                    <div className="input-double-row" style={{ marginTop: "10px" }}>
                      <div className="input-group">
                        <label className="input-label">Jumlah Karyawan Aktif</label>
                        <select name="optEmployeeCount" value={formData.optEmployeeCount} onChange={handleChange} className="reg-input reg-select">
                          <option value="">Pilih Skala...</option>
                          <option value="1-10">1 - 10 Karyawan</option>
                          <option value="11-50">11 - 50 Karyawan</option>
                          <option value="50+">Lebih dari 50 Karyawan</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Kategori Produk Utama</label>
                        <input
                          type="text"
                          name="optMainCategory"
                          placeholder="Elektronik / Bahan Bangunan / Makanan..."
                          value={formData.optMainCategory}
                          onChange={handleChange}
                          className="reg-input"
                        />
                      </div>
                    </div>

                    <div className="input-double-row" style={{ marginTop: "10px" }}>
                      <div className="input-group">
                        <label className="input-label">Estimasi Jumlah SKU Barang</label>
                        <select name="optSkuEstimate" value={formData.optSkuEstimate} onChange={handleChange} className="reg-input reg-select">
                          <option value="">Pilih Jumlah...</option>
                          <option value="Under 100">Kurang dari 100 SKU</option>
                          <option value="100-1000">100 - 1.000 SKU</option>
                          <option value="1000+">Lebih dari 1.000 SKU</option>
                        </select>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Estimasi Transaksi per Bulan</label>
                        <select name="optMonthlyTx" value={formData.optMonthlyTx} onChange={handleChange} className="reg-input reg-select">
                          <option value="">Pilih Frekuensi...</option>
                          <option value="Under 500">Kurang dari 500 transaksi</option>
                          <option value="500-2000">500 - 2.000 transaksi</option>
                          <option value="2000+">Lebih dari 2.000 transaksi</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    Kembali
                  </button>
                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Lanjut
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Konfirmasi */}
            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 4 dari 4</span>
                  <h2>Konfirmasi & Persetujuan</h2>
                  <p className="step-subtitle">Tinjau seluruh data Anda sebelum meluncurkan sistem operasional WMS.</p>
                </div>

                <div className="review-scroll-container">
                  <div className="review-grid">
                    <div className="review-section">
                      <h3>Profil Perusahaan</h3>
                      <div className="review-card-mini">
                        <p><strong>Nama Legal:</strong> {formData.companyName}</p>
                        <p><strong>Brand / Toko:</strong> {formData.companyBrand || "-"}</p>
                        <p><strong>Jenis Bisnis:</strong> {formData.companyIndustry}</p>
                        <p><strong>Alamat:</strong> {formData.companyAddress}, {formData.companyCity}</p>
                      </div>
                    </div>

                    <div className="review-section">
                      <h3>Profil Owner</h3>
                      <div className="review-card-mini">
                        <p><strong>Nama Lengkap:</strong> {formData.ownerName}</p>
                        <p><strong>Email Login:</strong> {formData.ownerEmail}</p>
                        <p><strong>Nomor HP:</strong> {formData.ownerPhone}</p>
                        <p><strong>Jabatan:</strong> {formData.ownerTitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="terms-container" style={{ marginTop: "10px" }}>
                    <h3 className="section-title-sub" style={{ margin: "0 0 6px 0", fontSize: "12px" }}>Syarat & Ketentuan Penggunaan</h3>
                    <div 
                      className="terms-scroll-box" 
                      ref={termsContentRef} 
                      onScroll={handleTermsScroll}
                      style={{ height: "100px" }}
                    >
                      <h4>1. KETENTUAN LAYANAN</h4>
                      <p>ReaStock menyediakan platform WMS cloud sebagai sarana pendataan stok barang. Anda bertanggung jawab penuh atas segala data yang dimasukkan ke dalam workspace perusahaan.</p>
                      <h4>2. KEBIJAKAN DATA & PRIVASI</h4>
                      <p>Kami menjamin kerahasiaan operasional, detail gudang, serta transaksi ritel Anda. Kami tidak akan menyebarkan data tersebut kepada pihak ketiga tanpa persetujuan.</p>
                      <h4>3. VALIDASI LEGALITAS</h4>
                      <p>Dengan mendaftar, Anda menyatakan bahwa seluruh operasional usaha Anda tunduk pada regulasi hukum Republik Indonesia yang berlaku.</p>
                    </div>

                    {!hasScrolledTerms && (
                      <div className="scroll-notice-banner animate-pulse">
                        <span>↓ Silakan gulir (scroll) syarat di atas hingga akhir untuk menyetujui.</span>
                      </div>
                    )}

                    <div className="terms-accept-checkbox">
                      <label className={`checkbox-label ${!hasScrolledTerms ? "label-disabled" : ""}`}>
                        <input
                          type="checkbox"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          disabled={!hasScrolledTerms}
                          className="reg-checkbox"
                        />
                        <span className="checkbox-text">
                          Saya mewakili Perusahaan memahami dan menyetujui seluruh Syarat & Ketentuan di atas secara sadar.
                        </span>
                      </label>
                      {errors.acceptTerms && <span className="error-text block-error">{errors.acceptTerms}</span>}
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    Kembali
                  </button>
                  <button type="button" className="btn-primary btn-submit" onClick={handleRegisterSubmit}>
                    Daftarkan Perusahaan
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Setup Page / Onboarding Checklist Dashboard (Foto 4) */}
            {step === 5 && (
              <motion.div key="step5" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content onboarding-step-content">
                <div className="onboarding-header">
                  <div className="onboarding-header-left">
                    <span className="badge-step badge-success">Workspace Siap!</span>
                    <h2>Setup Awal Operasional WMS</h2>
                    <p className="step-subtitle">Selamat! Perusahaan terdaftar. Selesaikan tugas awal berikut untuk meluncurkan WMS Anda.</p>
                  </div>
                  
                  {/* Circular progress display */}
                  <div className="onboarding-progress-container">
                    <div className="progress-bar-label-group">
                      <span className="progress-label-main">{progressPercent}% Selesai</span>
                      <span className="progress-label-sub">{stepProgress} dari 9 Tugas</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Grid of 9 onboarding tasks (Foto 4) */}
                <div className="onboarding-tasks-grid">
                  
                  {/* Task 1: Buat gudang pertama */}
                  <div className={`onboarding-task-card ${onboardingTasks.warehouse ? "task-completed" : ""}`} onClick={() => setActiveModal("warehouse")}>
                    <div className="task-card-icon">🏬</div>
                    <div className="task-card-content">
                      <h4>1. Buat Gudang Pertama</h4>
                      <p>{onboardingTasks.warehouse ? `Selesai: ${onboardingData.warehouseName}` : "Definisikan tempat penyimpanan utama barang."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.warehouse ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 2: Buat toko / cabang pertama */}
                  <div className={`onboarding-task-card ${onboardingTasks.store ? "task-completed" : ""}`} onClick={() => setActiveModal("store")}>
                    <div className="task-card-icon">🛒</div>
                    <div className="task-card-content">
                      <h4>2. Buat Toko / Cabang Pertama</h4>
                      <p>{onboardingTasks.store ? `Selesai: ${onboardingData.storeName}` : "Definisikan outlet penerima barang stok."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.store ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 3: Tambahkan kategori produk */}
                  <div className={`onboarding-task-card ${onboardingTasks.category ? "task-completed" : ""}`} onClick={() => setActiveModal("category")}>
                    <div className="task-card-icon">🗂️</div>
                    <div className="task-card-content">
                      <h4>3. Tambahkan Kategori Produk</h4>
                      <p>{onboardingTasks.category ? `Selesai: ${onboardingData.productCategory}` : "Klasifikasikan produk (Makanan, Elektronik, dll.)"}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.category ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 4: Tambahkan produk awal */}
                  <div className={`onboarding-task-card ${onboardingTasks.product ? "task-completed" : ""}`} onClick={() => setActiveModal("product")}>
                    <div className="task-card-icon">📦</div>
                    <div className="task-card-content">
                      <h4>4. Tambahkan Produk Awal</h4>
                      <p>{onboardingTasks.product ? `Selesai: ${onboardingData.productName}` : "Masukkan detail barang beserta SKU pertamanya."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.product ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 5: Tambahkan user gudang */}
                  <div className={`onboarding-task-card ${onboardingTasks.gudangUser ? "task-completed" : ""}`} onClick={() => setActiveModal("gudangUser")}>
                    <div className="task-card-icon">👨‍📦</div>
                    <div className="task-card-content">
                      <h4>5. Tambahkan Staff Gudang</h4>
                      <p>{onboardingTasks.gudangUser ? `Selesai: ${onboardingData.gudangStaffName}` : "Undang staff untuk mengelola stok di dalam gudang."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.gudangUser ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 6: Tambahkan user toko */}
                  <div className={`onboarding-task-card ${onboardingTasks.tokoUser ? "task-completed" : ""}`} onClick={() => setActiveModal("tokoUser")}>
                    <div className="task-card-icon">👩‍💼</div>
                    <div className="task-card-content">
                      <h4>6. Tambahkan Staff Toko</h4>
                      <p>{onboardingTasks.tokoUser ? `Selesai: ${onboardingData.tokoStaffName}` : "Undang staff kasir atau penanggung jawab outlet ritel."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.tokoUser ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 7: Atur minimum stok */}
                  <div className={`onboarding-task-card ${onboardingTasks.minStock ? "task-completed" : ""}`} onClick={() => setActiveModal("minStock")}>
                    <div className="task-card-icon">⚠️</div>
                    <div className="task-card-content">
                      <h4>7. Atur Batas Minimum Stok</h4>
                      <p>{onboardingTasks.minStock ? `Selesai: Batas ${onboardingData.minStockLevel} Unit` : "Setel batas peringatan ketika stok hampir habis."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.minStock ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 8: Pilih tema tampilan */}
                  <div className={`onboarding-task-card ${onboardingTasks.theme ? "task-completed" : ""}`} onClick={() => setActiveModal("theme")}>
                    <div className="task-card-icon">🎨</div>
                    <div className="task-card-content">
                      <h4>8. Pilih Tema Tampilan</h4>
                      <p>{onboardingTasks.theme ? `Tema terpilih: ${onboardingData.selectedTheme.toUpperCase()}` : "Sesuaikan skema warna dashboard sistem WMS."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.theme ? "✅" : "➕"}
                    </div>
                  </div>

                  {/* Task 9: Atur notifikasi */}
                  <div className={`onboarding-task-card ${onboardingTasks.notification ? "task-completed" : ""}`} onClick={() => setActiveModal("notification")}>
                    <div className="task-card-icon">🔔</div>
                    <div className="task-card-content">
                      <h4>9. Atur Notifikasi Alerts</h4>
                      <p>{onboardingTasks.notification ? "Setelan notifikasi disimpan." : "Pilih media pengiriman pengingat aktivitas."}</p>
                    </div>
                    <div className="task-card-status">
                      {onboardingTasks.notification ? "✅" : "➕"}
                    </div>
                  </div>

                </div>

                <div className="onboarding-actions" style={{ marginTop: "24px", display: "flex", gap: "16px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn-secondary" style={{ flex: "0 1 200px" }} onClick={goLogin}>
                    Lewati Setup
                  </button>
                  <button type="button" className="btn-primary btn-submit" style={{ flex: "0 1 280px" }} onClick={handleOnboardingComplete}>
                    {stepProgress === 9 ? "Selesai & Masuk WMS" : "Masuk ke Dashboard WMS"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>

      {/* =========================================================
         ONBOARDING DIALOGS / MODALS FOR STEP 5
         ========================================================= */}
      <AnimatePresence>
        {activeModal && (
          <div className="onboarding-modal-overlay">
            <motion.div 
              className="onboarding-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              
              {/* Modal Header */}
              <div className="onboarding-modal-header">
                <h3>
                  {activeModal === "warehouse" && "🏬 Setup Gudang Pertama"}
                  {activeModal === "store" && "🛒 Setup Toko / Cabang Pertama"}
                  {activeModal === "category" && "🗂️ Tambah Kategori Produk"}
                  {activeModal === "product" && "📦 Tambah Produk Awal"}
                  {activeModal === "gudangUser" && "👨‍📦 Tambah Staff Gudang"}
                  {activeModal === "tokoUser" && "👩‍💼 Tambah Staff Toko"}
                  {activeModal === "minStock" && "⚠️ Atur Batas Minimum Stok"}
                  {activeModal === "theme" && "🎨 Pilih Tema Tampilan"}
                  {activeModal === "notification" && "🔔 Konfigurasi Alerts"}
                </h3>
                <button className="close-modal-btn" onClick={() => setActiveModal(null)}>×</button>
              </div>

              {/* Modal Body */}
              <div className="onboarding-modal-body">
                
                {/* 1. Warehouse */}
                {activeModal === "warehouse" && (
                  <div className="modal-form-fields">
                    <div className="input-group">
                      <label className="input-label">Nama Gudang *</label>
                      <input 
                        type="text" 
                        name="warehouseName" 
                        placeholder="Contoh: Gudang Utama Jakarta" 
                        value={onboardingData.warehouseName}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Alamat Lengkap Gudang *</label>
                      <input 
                        type="text" 
                        name="warehouseAddress" 
                        placeholder="Contoh: Jl. Industri Pergudangan No. 5" 
                        value={onboardingData.warehouseAddress}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Tipe Gudang</label>
                      <select name="warehouseType" value={onboardingData.warehouseType} onChange={handleOnboardingChange} className="reg-input reg-select">
                        <option value="General">General / Umum (Multi-Produk)</option>
                        <option value="ColdStorage">Cold Storage (Makanan & Farmasi)</option>
                        <option value="Transit">Gudang Transit / Sortir</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 2. Store */}
                {activeModal === "store" && (
                  <div className="modal-form-fields">
                    <div className="input-group">
                      <label className="input-label">Nama Toko / Outlet Ritel *</label>
                      <input 
                        type="text" 
                        name="storeName" 
                        placeholder="Contoh: Sejahtera Mart Sudirman" 
                        value={onboardingData.storeName}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Alamat Toko / Outlet *</label>
                      <input 
                        type="text" 
                        name="storeAddress" 
                        placeholder="Contoh: Gedung Sudirman Center Lt. Dasar" 
                        value={onboardingData.storeAddress}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">No. Telepon Toko (Opsional)</label>
                      <input 
                        type="text" 
                        name="storePhone" 
                        placeholder="Contoh: 021-889212" 
                        value={onboardingData.storePhone}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Category */}
                {activeModal === "category" && (
                  <div className="modal-form-fields">
                    <div className="input-group">
                      <label className="input-label">Nama Kategori Produk *</label>
                      <input 
                        type="text" 
                        name="productCategory" 
                        placeholder="Contoh: Elektronik / Makanan Ringan / Pakaian" 
                        value={onboardingData.productCategory}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Deskripsi Kategori</label>
                      <input 
                        type="text" 
                        name="productCategoryDesc" 
                        placeholder="Deskripsi singkat kategori produk..." 
                        value={onboardingData.productCategoryDesc}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Product */}
                {activeModal === "product" && (
                  <div className="modal-form-fields">
                    <div className="input-double-row">
                      <div className="input-group">
                        <label className="input-label">Nama Produk *</label>
                        <input 
                          type="text" 
                          name="productName" 
                          placeholder="iPhone 15 Pro" 
                          value={onboardingData.productName}
                          onChange={handleOnboardingChange}
                          className="reg-input"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">SKU Produk *</label>
                        <input 
                          type="text" 
                          name="productSku" 
                          placeholder="APL-IPH15P" 
                          value={onboardingData.productSku}
                          onChange={handleOnboardingChange}
                          className="reg-input"
                        />
                      </div>
                    </div>
                    <div className="input-double-row" style={{ marginTop: "10px" }}>
                      <div className="input-group">
                        <label className="input-label">Harga Jual (Rp) *</label>
                        <input 
                          type="number" 
                          name="productPrice" 
                          placeholder="18000000" 
                          value={onboardingData.productPrice}
                          onChange={handleOnboardingChange}
                          className="reg-input"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Stok Masuk Awal *</label>
                        <input 
                          type="number" 
                          name="productStock" 
                          placeholder="50" 
                          value={onboardingData.productStock}
                          onChange={handleOnboardingChange}
                          className="reg-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Warehouse User */}
                {activeModal === "gudangUser" && (
                  <div className="modal-form-fields">
                    <div className="input-group">
                      <label className="input-label">Nama Staff Gudang *</label>
                      <input 
                        type="text" 
                        name="gudangStaffName" 
                        placeholder="Contoh: Rian Hidayat" 
                        value={onboardingData.gudangStaffName}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Email Staff *</label>
                      <input 
                        type="email" 
                        name="gudangStaffEmail" 
                        placeholder="rian@sejahtera.com" 
                        value={onboardingData.gudangStaffEmail}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Hak Akses Gudang</label>
                      <select name="gudangStaffRole" value={onboardingData.gudangStaffRole} onChange={handleOnboardingChange} className="reg-input reg-select">
                        <option value="Admin Gudang">Admin Gudang (Mengelola Input/Output)</option>
                        <option value="Picker / Packer">Picker / Packer (Pengemasan Stok)</option>
                        <option value="Kepala Gudang">Kepala Gudang (Supervisor)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 6. Store User */}
                {activeModal === "tokoUser" && (
                  <div className="modal-form-fields">
                    <div className="input-group">
                      <label className="input-label">Nama Staff Toko *</label>
                      <input 
                        type="text" 
                        name="tokoStaffName" 
                        placeholder="Contoh: Siska Amelia" 
                        value={onboardingData.tokoStaffName}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Email Staff *</label>
                      <input 
                        type="email" 
                        name="tokoStaffEmail" 
                        placeholder="siska@sejahtera.com" 
                        value={onboardingData.tokoStaffEmail}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Hak Akses Toko</label>
                      <select name="tokoStaffRole" value={onboardingData.tokoStaffRole} onChange={handleOnboardingChange} className="reg-input reg-select">
                        <option value="Kasir">Kasir (Transaksi Penjualan)</option>
                        <option value="Admin Toko">Admin Toko (Input Stok Masuk Toko)</option>
                        <option value="Manager Toko">Manager Toko (Kepala Cabang)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 7. Minimum Stock */}
                {activeModal === "minStock" && (
                  <div className="modal-form-fields">
                    <div className="input-group">
                      <label className="input-label">Ambang Batas Minimum Stok (Unit) *</label>
                      <input 
                        type="number" 
                        name="minStockLevel" 
                        placeholder="10" 
                        value={onboardingData.minStockLevel}
                        onChange={handleOnboardingChange}
                        className="reg-input"
                      />
                      <span className="input-hint" style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        Sistem akan memberi peringatan jika stok produk apa pun turun di bawah angka ini.
                      </span>
                    </div>
                    <div className="input-group" style={{ marginTop: "10px" }}>
                      <label className="input-label">Tingkat Prioritas Peringatan</label>
                      <select name="minStockAlert" value={onboardingData.minStockAlert} onChange={handleOnboardingChange} className="reg-input reg-select">
                        <option value="High">Tinggi (Merah - Email Instan & Notif WhatsApp)</option>
                        <option value="Medium">Sedang (Kuning - Log di Dashboard Utama)</option>
                        <option value="Low">Rendah (Hanya laporan pergerakan stok bulanan)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 8. Theme Selection */}
                {activeModal === "theme" && (
                  <div className="modal-form-fields">
                    <label className="input-label">Pilih Palet Warna Dasar Dasbor WMS:</label>
                    <div className="theme-selectors-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" }}>
                      
                      <div 
                        className={`theme-option-card theme-orange ${onboardingData.selectedTheme === "orange" ? "selected-theme" : ""}`}
                        onClick={() => setOnboardingData(p => ({ ...p, selectedTheme: "orange" }))}
                      >
                        <div className="theme-color-preview preview-orange"></div>
                        <span>Sunset Orange (Default)</span>
                      </div>

                      <div 
                        className={`theme-option-card theme-blue ${onboardingData.selectedTheme === "blue" ? "selected-theme" : ""}`}
                        onClick={() => setOnboardingData(p => ({ ...p, selectedTheme: "blue" }))}
                      >
                        <div className="theme-color-preview preview-blue"></div>
                        <span>Ocean Blue (Ritel & Tech)</span>
                      </div>

                      <div 
                        className={`theme-option-card theme-dark ${onboardingData.selectedTheme === "dark" ? "selected-theme" : ""}`}
                        onClick={() => setOnboardingData(p => ({ ...p, selectedTheme: "dark" }))}
                      >
                        <div className="theme-color-preview preview-dark"></div>
                        <span>Midnight Dark (Gaya Premium)</span>
                      </div>

                      <div 
                        className={`theme-option-card theme-light ${onboardingData.selectedTheme === "light" ? "selected-theme" : ""}`}
                        onClick={() => setOnboardingData(p => ({ ...p, selectedTheme: "light" }))}
                      >
                        <div className="theme-color-preview preview-light"></div>
                        <span>Minimal Light (Putih Bersih)</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* 9. Notifications */}
                {activeModal === "notification" && (
                  <div className="modal-form-fields">
                    <label className="input-label">Aktifkan Saluran Pengiriman Alerts:</label>
                    <div className="notification-switches-list" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                      
                      <label className="switch-item-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                        <div className="switch-text-group">
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Notifikasi Email Instan</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Untuk PO masuk, pemindahan stok, & log audit mingguan.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          name="notifEmail" 
                          checked={onboardingData.notifEmail} 
                          onChange={handleOnboardingChange}
                          className="reg-checkbox-toggle"
                        />
                      </label>

                      <label className="switch-item-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                        <div className="switch-text-group">
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Integrasi WhatsApp OTP & Alerts</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Notifikasi instan barang keluar & OTP login staff.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          name="notifWhatsApp" 
                          checked={onboardingData.notifWhatsApp} 
                          onChange={handleOnboardingChange}
                          className="reg-checkbox-toggle"
                        />
                      </label>

                      <label className="switch-item-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                        <div className="switch-text-group">
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Notifikasi Dashboard Sistem</span>
                          <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>Peringatan real-time saat Anda sedang membuka web.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          name="notifSystem" 
                          checked={onboardingData.notifSystem} 
                          onChange={handleOnboardingChange}
                          className="reg-checkbox-toggle"
                        />
                      </label>

                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="onboarding-modal-footer">
                <button type="button" className="btn-secondary" style={{ flex: "1" }} onClick={() => setActiveModal(null)}>Batal</button>
                <button type="button" className="btn-primary btn-submit" style={{ flex: "1" }} onClick={() => saveOnboardingTask(activeModal)}>Simpan Setelan</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
