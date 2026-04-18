import React, { useState, useEffect } from "react";
import MapPicker from "../components/MapPicker";

const BASE_URL = "http://165.22.91.187:5000/api/Admin/Pharmacy";

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [newPharmacy, setNewPharmacy] = useState({
    pharmacyName: "",
    userName: "",
    email: "",
    phoneNumber: "",
    password: "",
    address: "",
    latitude: "",
    longitude: "",
    isActive: true,
    image: null,
    imagePreview: "",
  });

  const getAuthToken = () => localStorage.getItem("authToken");

  const getFormDataHeaders = () => {
    const token = getAuthToken();
    return {
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(BASE_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please login again.");
        } else {
          setError(`Failed to fetch pharmacies. Status: ${response.status}`);
        }
        setLoading(false);
        return;
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setError("Invalid response from server.");
        setLoading(false);
        return;
      }

      const pharmaciesList = Array.isArray(data) ? data : [data];

      const normalized = pharmaciesList.map((p) => {
        const id =
          p.id ||
          p.Id ||
          p.ID ||
          p.pharmacyId ||
          p.PharmacyId ||
          p.userId ||
          p.UserId ||
          Math.random();

        return {
          id,
          pharmacyName:
            p.pharmacyName || p.PharmacyName || p.name || p.Name || "",
          userName: p.userName || p.UserName || "",
          email: p.email || p.Email || "",
          phoneNumber:
            p.phoneNumber || p.PhoneNumber || p.phone || p.Phone || "",
          address: p.address || p.Address || p.location || p.Location || "",
          latitude: p.latitude || p.Latitude || "",
          longitude: p.longitude || p.Longitude || "",
          image: p.image || p.Image || null, // من السيرفر مباشرة
          isActive:
            p.isActive !== undefined
              ? p.isActive
              : p.IsActive !== undefined
                ? p.IsActive
                : true,
        };
      });

      setPharmacies(normalized);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Connection error. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pharmacy?"))
      return;

    setDeleteLoadingId(id);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok && response.status !== 204) {
        let responseData = {};
        try {
          const text = await response.text();
          if (text) responseData = JSON.parse(text);
        } catch {}
        setError(
          responseData.message ||
            `Failed to delete pharmacy. Status: ${response.status}`,
        );
        setDeleteLoadingId(null);
        return;
      }

      setPharmacies((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Pharmacy deleted successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("❌ Delete error:", err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleEdit = (pharmacy) => {
    setEditingId(pharmacy.id);
    setEditForm({
      ...pharmacy,
      password: "",
      image: null,
      imagePreview: pharmacy.image || "",
    });
    setShowEditPassword(false);
    setError("");
    setSuccess("");
  };

  const handleNewPharmacyImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be less than 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPharmacy((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleEditPharmacyImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Image size must be less than 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setEditLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();

      const formData = new FormData();
      formData.append("PharmacyName", editForm.pharmacyName?.trim() || "");
      formData.append("UserName", editForm.userName?.trim() || "");
      formData.append("Email", editForm.email?.trim() || "");
      formData.append("PhoneNumber", editForm.phoneNumber?.trim() || "");
      formData.append("Address", editForm.address?.trim() || "");
      formData.append("IsActive", editForm.isActive);
      formData.append(
        "Latitude",
        editForm.latitude ? parseFloat(editForm.latitude) : 0,
      );
      formData.append(
        "Longitude",
        editForm.longitude ? parseFloat(editForm.longitude) : 0,
      );
      formData.append("Id", editingId);

      if (editForm.password?.trim()) {
        formData.append("Password", editForm.password);
      }

      if (editForm.image instanceof File) {
        formData.append("ImageFile", editForm.image); // ← الاسم الصح
      }

      const response = await fetch(`${BASE_URL}/${editingId}`, {
        method: "PUT",
        headers: getFormDataHeaders(),
        body: formData,
      });

      const responseText = await response.text();
      let responseData = {};
      try {
        if (responseText) responseData = JSON.parse(responseText);
      } catch {}

      if (!response.ok && response.status !== 204) {
        let errorMessage =
          responseData.message ||
          responseData.error ||
          `Server error: ${response.status}`;
        if (responseData.errors) {
          errorMessage = Object.values(responseData.errors).flat().join(", ");
        }
        setError(
          `Failed to update pharmacy (ID: ${editingId}): ${errorMessage}`,
        );
        setEditLoading(false);
        return;
      }

      await fetchPharmacies();

      setEditingId(null);
      setEditForm({});
      setShowEditPassword(false);
      setSuccess("Pharmacy updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("❌ Update error:", err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setShowEditPassword(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  const handleAddPharmacy = async () => {
    if (!newPharmacy.pharmacyName?.trim()) {
      setError("Pharmacy name is required.");
      return;
    }
    if (!newPharmacy.userName?.trim()) {
      setError("Username is required.");
      return;
    }
    if (!newPharmacy.email?.trim()) {
      setError("Email is required.");
      return;
    }
    if (!newPharmacy.password?.trim()) {
      setError("Password is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newPharmacy.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setAddLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();

      const formData = new FormData();
      formData.append("PharmacyName", newPharmacy.pharmacyName.trim());
      formData.append("UserName", newPharmacy.userName.trim());
      formData.append("Email", newPharmacy.email.trim());
      formData.append("Password", newPharmacy.password);
      formData.append("PhoneNumber", newPharmacy.phoneNumber?.trim() || "");
      formData.append("Address", newPharmacy.address?.trim() || "");
      formData.append("IsActive", newPharmacy.isActive);
      formData.append(
        "Latitude",
        newPharmacy.latitude ? parseFloat(newPharmacy.latitude) : 0,
      );
      formData.append(
        "Longitude",
        newPharmacy.longitude ? parseFloat(newPharmacy.longitude) : 0,
      );

      if (newPharmacy.image) {
        formData.append("ImageFile", newPharmacy.image); // ← الاسم الصح
      }

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: getFormDataHeaders(),
        body: formData,
      });

      const responseText = await response.text();
      let responseData = {};
      try {
        if (responseText) responseData = JSON.parse(responseText);
      } catch {}

      if (!response.ok) {
        const deepError =
          responseData?.innerException?.innerException?.message ||
          responseData?.innerException?.message ||
          responseData?.InnerException?.Message ||
          responseData?.message ||
          responseData?.Message ||
          responseData?.error ||
          responseText ||
          `Server error: ${response.status}`;

        if (responseData.errors) {
          setError(Object.values(responseData.errors).flat().join(", "));
        } else {
          setError(`Failed to add pharmacy: ${deepError}`);
        }
        setAddLoading(false);
        return;
      }

      await fetchPharmacies();

      setNewPharmacy({
        pharmacyName: "",
        userName: "",
        email: "",
        phoneNumber: "",
        password: "",
        address: "",
        latitude: "",
        longitude: "",
        isActive: true,
        image: null,
        imagePreview: "",
      });
      setShowAddForm(false);
      setShowAddPassword(false);
      setSuccess("Pharmacy added successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error("❌ Add error:", err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setNewPharmacy({
      pharmacyName: "",
      userName: "",
      email: "",
      phoneNumber: "",
      password: "",
      address: "",
      latitude: "",
      longitude: "",
      isActive: true,
      image: null,
      imagePreview: "",
    });
    setShowAddForm(false);
    setShowAddPassword(false);
    setError("");
  };

  const filteredPharmacies = pharmacies.filter(
    (pharmacy) =>
      pharmacy.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid var(--gray-300)",
    borderRadius: "4px",
  };

  const ImageUploadBox = ({ preview, onChange, size = 80 }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {preview ? (
        <img
          src={preview}
          alt="Pharmacy"
          style={{
            width: size,
            height: size,
            objectFit: "cover",
            borderRadius: "50%",
            border: "3px solid var(--primary-gold)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "2px dashed var(--gray-300)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
            gap: "4px",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#aaa"
            strokeWidth="1.5"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span style={{ fontSize: "9px", color: "#aaa" }}>No photo</span>
        </div>
      )}
      <label style={{ cursor: "pointer" }}>
        <span
          style={{
            fontSize: "11px",
            color: "var(--primary-gold)",
            textDecoration: "underline",
            fontWeight: "500",
          }}
        >
          {preview ? "📷 Change" : "📷 Upload"}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          style={{ display: "none" }}
        />
      </label>
      <small style={{ fontSize: "10px", color: "#999" }}>Max 3MB</small>
    </div>
  );

  return (
    <div className="page-content">
      <div className="section">
        <div className="section-header">
          <h3 className="section-title">All Pharmacies</h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="btn btn-secondary"
              onClick={fetchPharmacies}
              disabled={loading || addLoading || editLoading}
              style={{ padding: "8px 16px", fontSize: "14px" }}
            >
              🔄 Refresh
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setError("");
                setSuccess("");
              }}
            >
              {showAddForm ? "Cancel" : "+ Add Pharmacy"}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="success-message">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {showAddForm && (
          <div
            style={{
              backgroundColor: "var(--white)",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid var(--gray-200)",
            }}
          >
            <h4 style={{ marginBottom: "16px", color: "var(--gray-900)" }}>
              Add New Pharmacy
            </h4>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "var(--gray-700)",
                  }}
                >
                  Pharmacy Photo
                </p>
                <ImageUploadBox
                  preview={newPharmacy.imagePreview}
                  onChange={handleNewPharmacyImage}
                  size={90}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Pharmacy Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={newPharmacy.pharmacyName}
                  onChange={(e) =>
                    setNewPharmacy({
                      ...newPharmacy,
                      pharmacyName: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="Enter pharmacy name"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Username <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  value={newPharmacy.userName}
                  onChange={(e) =>
                    setNewPharmacy({ ...newPharmacy, userName: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter login username"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Email <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="email"
                  value={newPharmacy.email}
                  onChange={(e) =>
                    setNewPharmacy({ ...newPharmacy, email: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter email address"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Password <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showAddPassword ? "text" : "password"}
                    value={newPharmacy.password}
                    onChange={(e) =>
                      setNewPharmacy({
                        ...newPharmacy,
                        password: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="Enter password"
                    style={{ width: "100%", paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--medium-gray)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showAddPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={newPharmacy.phoneNumber}
                  onChange={(e) =>
                    setNewPharmacy({
                      ...newPharmacy,
                      phoneNumber: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="form-input"
                  placeholder="Numbers only"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Address
                </label>
                <input
                  type="text"
                  value={newPharmacy.address}
                  onChange={(e) =>
                    setNewPharmacy({ ...newPharmacy, address: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter address"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                  }}
                >
                  Status
                </label>
                <select
                  value={newPharmacy.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setNewPharmacy({
                      ...newPharmacy,
                      isActive: e.target.value === "active",
                    })
                  }
                  className="form-input"
                  style={{ width: "100%" }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontWeight: "500" }}>
                  Location <span style={{ color: "red" }}>*</span>
                </label>
                <MapPicker
                  latitude={newPharmacy.latitude}
                  longitude={newPharmacy.longitude}
                  onLocationChange={(lat, lng) =>
                    setNewPharmacy({
                      ...newPharmacy,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    })
                  }
                  height="350px"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                className="btn btn-primary"
                onClick={handleAddPharmacy}
                disabled={addLoading}
              >
                {addLoading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid #ffffff40",
                        borderTop: "2px solid #ffffff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Adding...
                  </span>
                ) : (
                  "Add Pharmacy"
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancelAdd}
                disabled={addLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="table-controls">
          <div className="search-box">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search pharmacies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--medium-gray)",
            }}
          >
            Loading pharmacies...
          </div>
        ) : error && pharmacies.length === 0 ? (
          <div className="error-message">
            ⚠️ {error}
            <button
              onClick={fetchPharmacies}
              style={{
                marginLeft: "12px",
                padding: "4px 12px",
                border: "1px solid #c62828",
                borderRadius: "4px",
                background: "transparent",
                color: "#c62828",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Pharmacy Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPharmacies.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--medium-gray)",
                      }}
                    >
                      {searchTerm
                        ? "No pharmacies match your search."
                        : "No pharmacies found."}
                    </td>
                  </tr>
                ) : (
                  filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id}>
                      <td style={{ textAlign: "center" }}>
                        {editingId === pharmacy.id ? (
                          <ImageUploadBox
                            preview={editForm.imagePreview || ""}
                            onChange={handleEditPharmacyImage}
                            size={60}
                          />
                        ) : pharmacy.image ? (
                          <img
                            src={pharmacy.image}
                            alt={pharmacy.pharmacyName}
                            style={{
                              width: "52px",
                              height: "52px",
                              objectFit: "cover",
                              borderRadius: "50%",
                              border: "2px solid var(--primary-gold)",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                            }}
                          />
                        ) : (
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(pharmacy.pharmacyName || pharmacy.userName || "P")}&background=FFD700&color=fff&size=128`}
                            alt={pharmacy.pharmacyName}
                            style={{
                              width: "52px",
                              height: "52px",
                              objectFit: "cover",
                              borderRadius: "50%",
                              border: "2px solid var(--primary-gold)",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                            }}
                          />
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="text"
                            value={editForm.pharmacyName || ""}
                            onChange={(e) =>
                              handleInputChange("pharmacyName", e.target.value)
                            }
                            className="form-input"
                            placeholder="Pharmacy name"
                            style={inputStyle}
                          />
                        ) : (
                          <span className="order-id">
                            {pharmacy.pharmacyName || "—"}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="text"
                            value={editForm.userName || ""}
                            onChange={(e) =>
                              handleInputChange("userName", e.target.value)
                            }
                            className="form-input"
                            placeholder="Login username"
                            style={inputStyle}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "13px",
                              color: "var(--medium-gray)",
                              fontFamily: "monospace",
                            }}
                          >
                            @{pharmacy.userName || "—"}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="form-input"
                            style={inputStyle}
                          />
                        ) : (
                          pharmacy.email || "—"
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="tel"
                            value={editForm.phoneNumber || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "phoneNumber",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            className="form-input"
                            placeholder="Numbers only"
                            style={inputStyle}
                          />
                        ) : (
                          pharmacy.phoneNumber || "—"
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <input
                            type="text"
                            value={editForm.address || ""}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="form-input"
                            style={inputStyle}
                          />
                        ) : (
                          pharmacy.address || "—"
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <div style={{ minWidth: "350px" }}>
                            <MapPicker
                              latitude={editForm.latitude}
                              longitude={editForm.longitude}
                              onLocationChange={(lat, lng) =>
                                setEditForm({
                                  ...editForm,
                                  latitude: lat.toString(),
                                  longitude: lng.toString(),
                                })
                              }
                              height="280px"
                            />
                          </div>
                        ) : pharmacy.latitude && pharmacy.longitude ? (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--medium-gray)",
                            }}
                          >
                            📍{" "}
                            <a
                              href={`https://www.google.com/maps?q=${pharmacy.latitude},${pharmacy.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "11px",
                                color: "#1976d2",
                                textDecoration: "underline",
                              }}
                            >
                              View on Google Maps
                            </a>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <select
                            value={editForm.isActive ? "active" : "inactive"}
                            onChange={(e) =>
                              handleInputChange(
                                "isActive",
                                e.target.value === "active",
                              )
                            }
                            style={inputStyle}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span
                            className={`status-badge ${pharmacy.isActive ? "active" : "offline"}`}
                          >
                            {pharmacy.isActive ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingId === pharmacy.id ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setShowEditPassword(!showEditPassword);
                                if (showEditPassword)
                                  handleInputChange("password", "");
                              }}
                              style={{
                                padding: "5px 10px",
                                fontSize: "12px",
                                border: `1px solid ${showEditPassword ? "#f44336" : "#2196f3"}`,
                                borderRadius: "6px",
                                background: "transparent",
                                color: showEditPassword ? "#f44336" : "#2196f3",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {showEditPassword
                                ? "✕ Cancel Password"
                                : "🔑 Change Password"}
                            </button>
                            {showEditPassword && (
                              <input
                                type="text"
                                value={editForm.password || ""}
                                onChange={(e) =>
                                  handleInputChange("password", e.target.value)
                                }
                                className="form-input"
                                placeholder="New password"
                                style={{ ...inputStyle, fontSize: "13px" }}
                              />
                            )}
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="action-btn"
                                title="Save"
                                onClick={handleSave}
                                disabled={editLoading}
                              >
                                {editLoading ? (
                                  <span
                                    style={{
                                      width: "14px",
                                      height: "14px",
                                      border: "2px solid #ccc",
                                      borderTop: "2px solid #333",
                                      borderRadius: "50%",
                                      display: "inline-block",
                                      animation: "spin 0.8s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                  </svg>
                                )}
                              </button>
                              <button
                                className="action-btn delete-btn"
                                title="Cancel"
                                onClick={handleCancel}
                                disabled={editLoading}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              className="action-btn"
                              title="Edit"
                              onClick={() => handleEdit(pharmacy)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Delete"
                              onClick={() => handleDelete(pharmacy.id)}
                              disabled={deleteLoadingId === pharmacy.id}
                            >
                              {deleteLoadingId === pharmacy.id ? (
                                <span
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    border: "2px solid #ccc",
                                    borderTop: "2px solid #f44336",
                                    borderRadius: "50%",
                                    display: "inline-block",
                                    animation: "spin 0.8s linear infinite",
                                  }}
                                />
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pharmacies;