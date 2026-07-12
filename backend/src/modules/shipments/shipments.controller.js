import prisma from "../../config/database.js";

function newId(prefix = "REQ") {
  const n = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${n}`;
}

function nowTimeHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

class ShipmentsController {
  // Driver accepts request: Siap Dikirim -> Pickup
  async driverAcceptRequest(req, res) {
    try {
      const { id } = req.params;
      const driverName = req.body.driverName || req.user.name || "Driver";
      const companyId = req.user.companyId;

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Siap Dikirim") {
        return res.status(400).json({
          success: false,
          message: "Request must be 'Siap Dikirim' to accept",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const updatedReq = await tx.tokoRequest.update({
          where: { id },
          data: {
            status: "Pickup",
            driverName,
            acceptedAt: new Date().toISOString(),
          }
        });

        // Create Notification
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "pickup",
            title: "Driver Mengambil Tugas",
            message: `Pesanan ${id} diambil oleh ${driverName}. Driver sedang menyiapkan bukti barang.`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "toko,gudang,admin",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Driver uploads cargo photo & resi: Pickup -> Mengirim, creates Shipment
  async driverUploadBukti(req, res) {
    try {
      const { id } = req.params;
      const { resi, foto } = req.body;
      const driverName = req.body.driverName || req.user.name || "Driver";
      const companyId = req.user.companyId;

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        },
        include: {
          fromBranch: true,
          toBranch: true
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Pickup") {
        return res.status(400).json({
          success: false,
          message: "Request must be in status 'Pickup' to start delivery",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Update request status
        const updatedReq = await tx.tokoRequest.update({
          where: { id },
          data: {
            status: "Mengirim",
            driverProofResi: resi || null,
            driverProofFoto: foto || null,
            shippingStartedAt: new Date().toISOString(),
          }
        });

        // Coordinates from Gudang (source: toBranch) and Toko (dest: fromBranch)
        const startLat = request.toBranch.lat || -6.2;
        const startLng = request.toBranch.lng || 106.8166;
        const endLat = request.fromBranch.lat || -6.1754;
        const endLng = request.fromBranch.lng || 106.8272;

        const startAddress = request.toBranch.location || "Gudang Pusat";
        const endAddress = request.fromBranch.location || "Toko Cabang";

        // Calculate distance via Haversine
        const R = 6371; // Earth radius in km
        const dLat = (endLat - startLat) * Math.PI / 180;
        const dLng = (endLng - startLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distKm = R * c;

        let estimatedMinutes = Math.round(distKm * 3);
        if (estimatedMinutes < 2) estimatedMinutes = 2;
        if (estimatedMinutes > 180) estimatedMinutes = 180;

        // 2. Create or Upsert Shipment
        await tx.shipment.upsert({
          where: { requestId: id },
          update: {
            startAddress,
            endAddress,
            startLat,
            startLng,
            endLat,
            endLng,
            startedAt: Date.now(),
            durationMs: 1000 * 60 * estimatedMinutes,
            driverLat: startLat,
            driverLng: startLng,
            driverName,
            driverIsLive: true,
          },
          create: {
            requestId: id,
            startAddress,
            endAddress,
            startLat,
            startLng,
            endLat,
            endLng,
            startedAt: Date.now(),
            durationMs: 1000 * 60 * estimatedMinutes,
            driverLat: startLat,
            driverLng: startLng,
            driverName,
            driverIsLive: true,
          }
        });

        // 3. Create Notification
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "shipping",
            title: "Pengiriman Dimulai",
            message: `Pesanan ${id} sedang dalam perjalanan oleh ${driverName}. Bukti telah diunggah.`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "toko,gudang,admin",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Driver updates live GPS coordinates
  async updateLocation(req, res) {
    try {
      const { id } = req.params; // references requestId
      const { lat, lng, progress } = req.body;
      const companyId = req.user.companyId;

      const shipment = await prisma.shipment.findFirst({
        where: {
          requestId: id,
          request: {
            fromBranch: { companyId }
          }
        }
      });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Active shipment tracking not found",
        });
      }

      const updated = await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          driverLat: parseFloat(lat),
          driverLng: parseFloat(lng),
          driverIsLive: true,
          driverProgress: progress !== undefined ? parseFloat(progress) : undefined,
        }
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Driver completes request delivery: Diterima Toko -> Selesai
  async driverCompleteDelivery(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      const request = await prisma.tokoRequest.findFirst({
        where: {
          id,
          fromBranch: { companyId }
        }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      if (request.status !== "Diterima Toko") {
        return res.status(400).json({
          success: false,
          message: "Request status must be 'Diterima Toko' to complete",
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Update Request status to Selesai
        const updatedReq = await tx.tokoRequest.update({
          where: { id },
          data: {
            status: "Selesai",
            completedAt: new Date().toISOString(),
          }
        });

        // 2. Set driverIsLive = false in Shipment
        await tx.shipment.updateMany({
          where: { requestId: id },
          data: {
            driverIsLive: false
          }
        });

        // 3. Create Notification
        await tx.notification.create({
          data: {
            id: newId("NTF"),
            type: "shipping_complete",
            title: "Pengiriman Selesai",
            message: `Driver telah menyelesaikan pengiriman untuk Request ${id}.`,
            time: nowTimeHHMM(),
            isRead: false,
            targetRoles: "toko,gudang,admin",
            companyId,
          }
        });

        return updatedReq;
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get active shipment details by requestId
  async getShipment(req, res) {
    try {
      const { requestId } = req.params;
      const companyId = req.user.companyId;

      const shipment = await prisma.shipment.findFirst({
        where: {
          requestId,
          request: {
            fromBranch: { companyId }
          }
        }
      });

      // Format to frontend shape
      if (!shipment) {
        return res.json({
          success: true,
          data: null,
        });
      }

      const responseData = {
        startAddress: shipment.startAddress,
        endAddress: shipment.endAddress,
        start: { lat: shipment.startLat, lng: shipment.startLng },
        end: { lat: shipment.endLat, lng: shipment.endLng },
        startedAt: Number(shipment.startedAt),
        durationMs: shipment.durationMs,
        driver: { lat: shipment.driverLat, lng: shipment.driverLng, isLive: shipment.driverIsLive },
        driverName: shipment.driverName,
        driverProgress: shipment.driverProgress,
      };

      return res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get logged-in driver profile
  async getDriverProfile(req, res) {
    try {
      const { id } = req.user;
      const profile = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          joinedAt: true,
          vehicle: true,
          nomorSim: true,
          alamatDomisili: true,
          statusMitra: true,
        }
      });

      const responseData = {
        name: profile.name,
        email: profile.email || profile.username,
        phone: profile.phone || "",
        role: profile.role,
        joinedAt: profile.joinedAt || "",
        vehicle: profile.vehicle || "",
        status: "Online",
        lastLogin: new Date().toLocaleString(),
      };

      return res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update logged-in driver profile
  async updateDriverProfile(req, res) {
    try {
      const { id } = req.user;
      const { name, phone, vehicle, nomorSim, alamatDomisili } = req.body;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
          vehicle: vehicle !== undefined ? vehicle : undefined,
          nomorSim: nomorSim !== undefined ? nomorSim : undefined,
          alamatDomisili: alamatDomisili !== undefined ? alamatDomisili : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          vehicle: true,
          nomorSim: true,
          alamatDomisili: true,
        }
      });

      return res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new ShipmentsController();
