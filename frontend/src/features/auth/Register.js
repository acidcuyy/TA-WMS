import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Register.css";

import logo from "../../assets/images/logo.png";
import SplitText from "../../components/animations/SplitText";
import { registerCompanyAndAdmin } from "../../services/wmsApi";

export default function Register() {
  const nav = useNavigate();
  const easing = useMemo(() => [0.22, 1, 0.36, 1], []);

  const [step, setStep] = useState(1);
  const [isLeaving, setIsLeaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Registration Form State
  const [formData, setFormData] = useState({
    // Step 1: Data Perusahaan
    companyName: "",
    companyIndustry: "",
    companyIndustryOther: "",
    companyNib: "",
    companyAddress: "",
    
    // Step 2: PIC
    picName: "",
    picTitle: "",
    picEmail: "",
    picPhone: "",

    // Step 3: Akun
    accountUsername: "",
    accountPassword: "",
    accountConfirmPassword: "",
    
    // Step 4: Upload Dokumen
    docLogo: "", 
    docNibNpwp: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    if (name === "picName" || name === "picTitle") {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "companyNib" || name === "picPhone") {
      filteredValue = value.replace(/[^0-9]/g, "");
      if (name === "companyNib" && filteredValue.length > 13) {
        filteredValue = filteredValue.slice(0, 13);
      }
    } else if (name === "companyName") {
      filteredValue = value.replace(/[^a-zA-Z0-9\s.,&-]/g, "");
    } else if (name === "companyAddress") {
      filteredValue = value.replace(/[^a-zA-Z0-9\s.,-]/g, "");
    } else if (name === "accountUsername") {
      filteredValue = value.replace(/[^a-zA-Z0-9_]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: filteredValue,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400; // compress to save localStorage space
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            setFormData((prev) => ({
              ...prev,
              [name]: canvas.toDataURL('image/jpeg', 0.5),
            }));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Untuk file non-image (seperti PDF), kita simpan dummy string 
        // karena menyimpan file utuh ke localStorage akan menyebabkan QuotaExceededError
        setFormData((prev) => ({
          ...prev,
          [name]: `[Dokumen Terlampir: ${file.name}]`,
        }));
      }
    }
  };

  const validateStep = (currentStep) => {
    const stepErrors = {};
    
    if (currentStep === 1) {
      if (!formData.companyName.trim()) stepErrors.companyName = "Nama Perusahaan wajib diisi.";
      if (!formData.companyIndustry) {
        stepErrors.companyIndustry = "Jenis Perusahaan wajib dipilih.";
      } else if (formData.companyIndustry === "Lainnya" && !formData.companyIndustryOther.trim()) {
        stepErrors.companyIndustryOther = "Harap sebutkan jenis perusahaan.";
      }
      if (!formData.companyNib.trim()) stepErrors.companyNib = "NIB wajib diisi.";
      if (!formData.companyAddress.trim()) stepErrors.companyAddress = "Alamat wajib diisi.";
    } 
    else if (currentStep === 2) {
      if (!formData.picName.trim()) stepErrors.picName = "Nama Lengkap wajib diisi.";
      if (!formData.picTitle.trim()) stepErrors.picTitle = "Jabatan wajib diisi.";
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.picEmail.trim()) {
        stepErrors.picEmail = "Email wajib diisi.";
      } else if (!emailRegex.test(formData.picEmail)) {
        stepErrors.picEmail = "Format email tidak valid.";
      }

      if (!formData.picPhone.trim()) stepErrors.picPhone = "No HP wajib diisi.";
    } 
    else if (currentStep === 3) {
      if (!formData.accountUsername.trim()) {
        stepErrors.accountUsername = "Username Login wajib diisi.";
      } else if (formData.accountUsername.trim().length < 3) {
        stepErrors.accountUsername = "Username minimal 3 karakter.";
      } else if (/\s/.test(formData.accountUsername)) {
        stepErrors.accountUsername = "Username tidak boleh mengandung spasi.";
      }

      if (!formData.accountPassword) {
        stepErrors.accountPassword = "Kata sandi wajib diisi.";
      } else if (formData.accountPassword.length < 8) {
        stepErrors.accountPassword = "Kata sandi minimal 8 karakter.";
      }

      if (formData.accountPassword !== formData.accountConfirmPassword) {
        stepErrors.accountConfirmPassword = "Konfirmasi kata sandi tidak cocok.";
      }
    }
    // Step 4 allows empty for document links (mock up)

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      // Save data
      await registerCompanyAndAdmin({
        company: {
          name: formData.companyName,
          industry: formData.companyIndustry === "Lainnya" ? formData.companyIndustryOther : formData.companyIndustry,
          nib: formData.companyNib,
          address: formData.companyAddress,
          logo: formData.docLogo,
          document: formData.docNibNpwp
        },
        admin: {
          name: formData.picName,
          title: formData.picTitle,
          username: formData.accountUsername, // use login username
          email: formData.picEmail, // use PIC email
          phone: formData.picPhone,
          password: formData.accountPassword
        }
      });

      goLogin();
    }
  };

  const goLogin = () => {
    setIsLeaving(true);
    setTimeout(() => {
      nav("/login");
    }, 420);
  };

  const variants = {
    initial: { x: 50, opacity: 0, scale: 0.98 },
    animate: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: easing } },
    exit: { x: -50, opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: easing } },
  };

  const stepsList = [
    { num: 1, label: "Data Perusahaan", desc: "Informasi legal usaha" },
    { num: 2, label: "PIC", desc: "Penanggung jawab" },
    { num: 3, label: "Akun", desc: "Kredensial login admin" },
    { num: 4, label: "Dokumen", desc: "Unggah legalitas" }
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
      <div className="bg-blur-blob blob-1"></div>
      <div className="bg-blur-blob blob-2"></div>
      <div className="bg-blur-blob blob-3"></div>

      <motion.div
        className="register-card"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: easing }}
      >
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

        <div className="register-right">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Data Perusahaan */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 1 dari 4</span>
                  <h2>Data Perusahaan</h2>
                  <p className="step-subtitle">Masukkan informasi dasar mengenai perusahaan Anda.</p>
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
                      <label className="input-label">Jenis Perusahaan *</label>
                      <select
                        name="companyIndustry"
                        value={formData.companyIndustry}
                        onChange={handleChange}
                        className={`reg-input reg-select ${errors.companyIndustry ? "input-error" : ""}`}
                      >
                        <option value="">-- Pilih Jenis --</option>
                        <option value="Retail">Retail</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Manufaktur">Manufaktur</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      {errors.companyIndustry && <span className="error-text">{errors.companyIndustry}</span>}
                    </div>
                  </div>

                  {formData.companyIndustry === "Lainnya" && (
                    <div className="input-group" style={{ marginBottom: "16px" }}>
                      <label className="input-label">Sebutkan Jenis Perusahaan *</label>
                      <input
                        type="text"
                        name="companyIndustryOther"
                        placeholder="Masukkan jenis usaha Anda"
                        value={formData.companyIndustryOther}
                        onChange={handleChange}
                        className={`reg-input ${errors.companyIndustryOther ? "input-error" : ""}`}
                      />
                      {errors.companyIndustryOther && <span className="error-text">{errors.companyIndustryOther}</span>}
                    </div>
                  )}

                  <div className="input-group" style={{ marginBottom: "16px" }}>
                    <label className="input-label">NIB (Nomor Induk Berusaha) *</label>
                    <input
                      type="text"
                      name="companyNib"
                      placeholder="Masukkan 13 digit NIB"
                      value={formData.companyNib}
                      onChange={handleChange}
                      className={`reg-input ${errors.companyNib ? "input-error" : ""}`}
                    />
                    {errors.companyNib && <span className="error-text">{errors.companyNib}</span>}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Alamat Lengkap *</label>
                    <input
                      type="text"
                      name="companyAddress"
                      placeholder="Masukkan alamat lengkap perusahaan"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      className={`reg-input ${errors.companyAddress ? "input-error" : ""}`}
                    />
                    {errors.companyAddress && <span className="error-text">{errors.companyAddress}</span>}
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

            {/* Step 2: PIC */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 2 dari 4</span>
                  <h2>PIC (Person In Charge)</h2>
                  <p className="step-subtitle">Informasi penanggung jawab perusahaan.</p>
                </div>

                <div className="form-grid">
                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Nama Lengkap *</label>
                      <input
                        type="text"
                        name="picName"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.picName}
                        onChange={handleChange}
                        className={`reg-input ${errors.picName ? "input-error" : ""}`}
                      />
                      {errors.picName && <span className="error-text">{errors.picName}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Jabatan *</label>
                      <input
                        type="text"
                        name="picTitle"
                        placeholder="Contoh: Direktur / Manager"
                        value={formData.picTitle}
                        onChange={handleChange}
                        className={`reg-input ${errors.picTitle ? "input-error" : ""}`}
                      />
                      {errors.picTitle && <span className="error-text">{errors.picTitle}</span>}
                    </div>
                  </div>

                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Email PIC *</label>
                      <input
                        type="email"
                        name="picEmail"
                        placeholder="Contoh: budi@perusahaan.com"
                        value={formData.picEmail}
                        onChange={handleChange}
                        className={`reg-input ${errors.picEmail ? "input-error" : ""}`}
                      />
                      {errors.picEmail && <span className="error-text">{errors.picEmail}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">No HP *</label>
                      <input
                        type="text"
                        name="picPhone"
                        placeholder="Contoh: 08123456789"
                        value={formData.picPhone}
                        onChange={handleChange}
                        className={`reg-input ${errors.picPhone ? "input-error" : ""}`}
                      />
                      {errors.picPhone && <span className="error-text">{errors.picPhone}</span>}
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

            {/* Step 3: Akun */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 3 dari 4</span>
                  <h2>Informasi Akun Admin</h2>
                  <p className="step-subtitle">Buat kredensial login untuk akses sistem.</p>
                </div>

                <div className="form-grid">
                  <div className="input-group" style={{ marginBottom: "16px" }}>
                    <label className="input-label">Username Login *</label>
                    <input
                      type="text"
                      name="accountUsername"
                      placeholder="Username untuk masuk ke aplikasi"
                      value={formData.accountUsername}
                      onChange={handleChange}
                      className={`reg-input ${errors.accountUsername ? "input-error" : ""}`}
                    />
                    {errors.accountUsername && <span className="error-text">{errors.accountUsername}</span>}
                  </div>

                  <div className="input-double-row">
                    <div className="input-group">
                      <label className="input-label">Password *</label>
                      <input
                        type="password"
                        name="accountPassword"
                        placeholder="Minimal 8 karakter"
                        value={formData.accountPassword}
                        onChange={handleChange}
                        className={`reg-input ${errors.accountPassword ? "input-error" : ""}`}
                      />
                      {errors.accountPassword && <span className="error-text">{errors.accountPassword}</span>}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Konfirmasi Password *</label>
                      <input
                        type="password"
                        name="accountConfirmPassword"
                        placeholder="Ulangi password"
                        value={formData.accountConfirmPassword}
                        onChange={handleChange}
                        className={`reg-input ${errors.accountConfirmPassword ? "input-error" : ""}`}
                      />
                      {errors.accountConfirmPassword && <span className="error-text">{errors.accountConfirmPassword}</span>}
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

            {/* Step 4: Upload Dokumen */}
            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="initial" animate="animate" exit="exit" className="step-content">
                <div className="step-header">
                  <span className="badge-step">Langkah 4 dari 4</span>
                  <h2>Upload Dokumen</h2>
                  <p className="step-subtitle">Lampirkan logo dan dokumen legalitas perusahaan (opsional).</p>
                </div>

                <div className="form-grid">
                  <div className="input-group" style={{ marginBottom: "16px" }}>
                    <label className="input-label">Logo Perusahaan</label>
                    <input
                      type="file"
                      accept="image/*"
                      name="docLogo"
                      onChange={handleFileChange}
                      className="reg-input"
                      style={{ padding: "8px" }}
                    />
                    <small style={{ color: "#64748b", fontSize: "12px", marginTop: "4px", display: "block" }}>Biarkan kosong jika tidak ada logo saat ini.</small>
                  </div>

                  <div className="input-group">
                    <label className="input-label">NIB / NPWP (Dokumen Pendukung)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      name="docNibNpwp"
                      onChange={handleFileChange}
                      className="reg-input"
                      style={{ padding: "8px" }}
                    />
                    <small style={{ color: "#64748b", fontSize: "12px", marginTop: "4px", display: "block" }}>Biarkan kosong jika akan diunggah nanti.</small>
                  </div>
                </div>

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={handlePrev}>
                    Kembali
                  </button>
                  <button type="button" className="btn-primary btn-submit" onClick={handleRegisterSubmit}>
                    Daftar Sekarang
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
