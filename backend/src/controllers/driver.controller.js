import {
  getDriverProfile as dbGetDriverProfile,
  updateDriverProfile as dbUpdateDriverProfile,
  getAllRequests,
  updateRequestStatus,
  createShipment,
  createNotification,
} from "../services/data.service.js";

export const getDriverDashboard = async (req, res) => {
  try {
    const profile = await dbGetDriverProfile() || { name: "Driver", role: "Driver Utama" };
    const allReq = await getAllRequests();

    const readyTasks  = allReq.filter(r => r.status === "Siap Dikirim");
    const activeTask  = allReq.find(r => r.status === "Mengirim" && r.driver_name === profile.name);
    const historyTasks = allReq
      .filter(r => r.status === "Selesai" && r.driver_name === profile.name)
      .slice(0, 5);

    res.status(200).json({ profile, readyTasks, activeTask, historyTasks });
  } catch (err) {
    console.error("Error getDriverDashboard:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDriverHistory = async (req, res) => {
  try {
    const profile = await dbGetDriverProfile() || { name: "" };
    const allReq = await getAllRequests();
    const history = allReq.filter(r => r.status === "Selesai" && r.driver_name === profile.name);
    res.status(200).json({ history });
  } catch (err) {
    console.error("Error getDriverHistory:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDriverProfile = async (req, res) => {
  try {
    const profile = await dbGetDriverProfile();
    if (!profile) return res.status(404).json({ message: "Profile tidak ditemukan" });
    res.status(200).json(profile);
  } catch (err) {
    console.error("Error getDriverProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDriverProfile = async (req, res) => {
  try {
    const updated = await dbUpdateDriverProfile(req.body);
    res.status(200).json({ message: "Profile berhasil diperbarui", profile: updated });
  } catch (err) {
    console.error("Error updateDriverProfile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverName } = req.body;

    const allReq = await getAllRequests();
    const r = allReq.find(x => x.id === id);

    if (!r)                          return res.status(404).json({ message: "Task tidak ditemukan" });
    if (r.status !== "Siap Dikirim") return res.status(400).json({ message: "Task belum siap diambil" });

    const name = driverName || "Driver";

    await updateRequestStatus(id, "Mengirim", { driverName: name });
    await createShipment(id, name);
    await createNotification({
      type: "shipping",
      title: "Driver Mengambil Tugas",
      message: `Pesanan ${id} sedang dikirim oleh ${name}`,
      targetRoles: ["toko", "gudang", "admin"],
    });

    res.status(200).json({ message: "Tugas berhasil diambil" });
  } catch (err) {
    console.error("Error acceptTask:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
