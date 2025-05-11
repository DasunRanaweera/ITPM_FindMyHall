import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FaFilePdf, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaTimes,
  FaBuilding,
  FaLayerGroup,
  FaUsers
} from 'react-icons/fa';

const HallForm = () => {
  const [halls, setHalls] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [name, setName] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState("");
  const [selectedFloorFilter, setSelectedFloorFilter] = useState("");
  const [filteredHalls, setFilteredHalls] = useState([]);

  useEffect(() => {
    fetchHalls();
    fetchBuildings();
  }, []);

  useEffect(() => {
    filterHalls();
  }, [selectedBuildingFilter, selectedFloorFilter, halls]);

  const filterHalls = () => {
    let filtered = [...halls];
    
    if (selectedBuildingFilter) {
      filtered = filtered.filter(hall => hall.building?._id === selectedBuildingFilter);
    }
    
    if (selectedFloorFilter) {
      filtered = filtered.filter(hall => hall.floor === parseInt(selectedFloorFilter));
    }
    
    setFilteredHalls(filtered);
  };

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8070/hall");
      setHalls(res.data);
      setError("");
    } catch (err) {
      setError("Error fetching halls. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const res = await axios.get("http://localhost:8070/building");
      setBuildings(res.data);
    } catch (err) {
      setError("Error fetching buildings. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^[A-Za-z0-9 ]+$/.test(name)) {
      setError("Hall name can only contain letters, numbers, and spaces.");
      return;
    }
    if (!selectedBuilding || !floor || floor < 1 || capacity < 1) {
      setError("Please fill in all fields correctly.");
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("building", selectedBuilding);
    formData.append("floor", floor);
    formData.append("capacity", capacity);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`http://localhost:8070/hall/update/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:8070/hall/add", formData);
      }

      setName("");
      setSelectedBuilding("");
      setFloor("");
      setCapacity("");
      setImage(null);
      setEditingId(null);
      fetchHalls();
    } catch {
      setError("Error saving hall. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this hall?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:8070/hall/delete/${id}`);
        fetchHalls();
      } catch {
        setError("Error deleting hall. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (hall) => {
    setName(hall.name);
    setSelectedBuilding(hall.building._id);
    setFloor(hall.floor);
    setCapacity(hall.capacity);
    setEditingId(hall._id);
    setShowForm(true);
  };

  const getFloorOptions = () => {
    const building = buildings.find((b) => b._id === selectedBuilding);
    if (!building) return [];
    return Array.from({ length: building.floors }, (_, i) => i + 1);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Hall Management Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = halls.map(hall => [
      hall.name,
      hall.building?.name || 'N/A',
      hall.floor,
      hall.capacity
    ]);

    autoTable(doc, {
      head: [['Hall Name', 'Building', 'Floor', 'Capacity']],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
      },
    });

    doc.save('hall-management-report.pdf');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchHalls();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8070/hall/search?query=${searchQuery}`);
      setHalls(response.data);
      setError("");
    } catch {
      setError("Error searching halls");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0",
      backgroundImage: 'url(https://www.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg)',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    },
    nav: {
      backgroundColor: "#1f2937",
      padding: "1.5rem 2rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    navContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    navTitle: {
      color: "white",
      fontSize: "1.5rem",
      fontWeight: "600",
      margin: 0,
    },
    navLinks: {
      display: "flex",
      gap: "1.5rem",
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    navLink: {
      color: "#e5e7eb",
      textDecoration: "none",
      fontWeight: "500",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
    activeNavLink: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    mainContent: {
      maxWidth: "1200px",
      margin: "2rem auto",
      padding: "0 2rem",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: 0,
    },
    actionButtons: {
      display: "flex",
      gap: "1rem",
    },
    button: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "500",
      transition: "all 0.2s ease",
    },
    primaryButton: {
      backgroundColor: "#3b82f6",
      color: "white",
      ":hover": {
        backgroundColor: "#2563eb",
      },
    },
    successButton: {
      backgroundColor: "#10b981",
      color: "white",
      ":hover": {
        backgroundColor: "#059669",
      },
    },
    dangerButton: {
      backgroundColor: "#ef4444",
      color: "white",
      ":hover": {
        backgroundColor: "#dc2626",
      },
    },
    formContainer: {
      backgroundColor: "white",
      borderRadius: "1rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      padding: "2rem",
      marginBottom: "2rem",
    },
    formTitle: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "1.5rem",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontWeight: "500",
      color: "#374151",
    },
    input: {
      width: "100%",
      padding: "0.75rem 1rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      transition: "all 0.2s ease",
      ":focus": {
        borderColor: "#3b82f6",
        outline: "none",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    select: {
      width: "100%",
      padding: "0.75rem 1rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      backgroundColor: "white",
      transition: "all 0.2s ease",
      ":focus": {
        borderColor: "#3b82f6",
        outline: "none",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    searchContainer: {
      marginBottom: "2rem",
      position: "relative",
    },
    searchInput: {
      width: "100%",
      padding: "0.75rem 1rem 0.75rem 3rem",
      border: "1px solid #e5e7eb",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      transition: "all 0.2s ease",
      ":focus": {
        borderColor: "#3b82f6",
        outline: "none",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
      },
    },
    searchIcon: {
      position: "absolute",
      left: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
    },
    clearSearch: {
      position: "absolute",
      right: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      backgroundColor: "transparent",
      border: "none",
      color: "#9ca3af",
      cursor: "pointer",
      ":hover": {
        color: "#6b7280",
      },
    },
    categoryButtons: {
      display: "flex",
      gap: "0.75rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
    },
    categoryButton: {
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#e5e7eb",
      color: "#374151",
      fontWeight: "500",
      fontSize: "0.875rem",
      transition: "all 0.2s ease",
    },
    activeCategoryButton: {
      backgroundColor: "#3b82f6",
      color: "white",
    },
    floorButtons: {
      display: "flex",
      gap: "0.75rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
    },
    floorButton: {
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#e5e7eb",
      color: "#374151",
      fontWeight: "500",
      fontSize: "0.875rem",
      transition: "all 0.2s ease",
    },
    activeFloorButton: {
      backgroundColor: "#10b981",
      color: "white",
    },
    hallsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    hallCard: {
      backgroundColor: "white",
      borderRadius: "1rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      transition: "all 0.2s ease",
      ":hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      },
    },
    hallImage: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
    },
    hallContent: {
      padding: "1.5rem",
    },
    hallName: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "0.5rem",
    },
    hallDetails: {
      color: "#6b7280",
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    cardActions: {
      display: "flex",
      gap: "0.5rem",
      marginTop: "1rem",
    },
    cardButton: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      border: "none",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "500",
      transition: "all 0.2s ease",
    },
    editButton: {
      backgroundColor: "#fbbf24",
      color: "#1f2937",
      ":hover": {
        backgroundColor: "#f59e0b",
      },
    },
    deleteButton: {
      backgroundColor: "#fef2f2",
      color: "#ef4444",
      ":hover": {
        backgroundColor: "#fee2e2",
      },
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#b91c1c",
      padding: "1rem",
      borderRadius: "0.5rem",
      marginBottom: "1.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    emptyState: {
      textAlign: "center",
      padding: "2rem",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <h1 style={styles.navTitle}>Admin Dashboard</h1>
          <ul style={styles.navLinks}>
            <li>
              <a href="http://localhost:3000/" style={styles.navLink}>Home</a>
            </li>
            <li><NavLink to="/adminpanel" style={styles.navLink} activeStyle={styles.activeNavLink}>Announcement</NavLink></li>
            <li><NavLink to="/building" style={styles.navLink} activeStyle={styles.activeNavLink}>Building</NavLink></li>
            <li><NavLink to="/hall" style={styles.navLink} activeStyle={styles.activeNavLink}>Hall</NavLink></li>
            <li><Link to="/feedbackpanel" style={styles.navLink}>Review</Link></li>
            <li><Link to="/usermanagement" style={styles.navLink}>User Management</Link></li>
          </ul>
        </div>
      </nav>

      <div style={styles.mainContent}>
        {/* Header with actions */}
        <div style={styles.header}>
          <h2 style={styles.title}>Hall Management</h2>
          <div style={styles.actionButtons}>
            <button
              style={{ ...styles.button, ...styles.successButton }}
              onClick={generatePDF}
            >
              <FaFilePdf /> Generate PDF
            </button>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={() => {
                setShowForm(!showForm);
                if (editingId) {
                  setName("");
                  setSelectedBuilding("");
                  setFloor("");
                  setCapacity("");
                  setImage(null);
                  setEditingId(null);
                }
              }}
            >
              <FaPlus /> {showForm ? "Cancel" : "Add Hall"}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div style={styles.errorMessage}>
            {error}
            <button 
              onClick={() => setError("")} 
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Search bar */}
        <div style={styles.searchContainer}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search halls by name or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={styles.clearSearch}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Building Category Buttons */}
        <div style={styles.categoryButtons}>
          <button
            style={{
              ...styles.categoryButton,
              ...(selectedBuildingFilter === "" ? styles.activeCategoryButton : {})
            }}
            onClick={() => setSelectedBuildingFilter("")}
          >
            All Buildings
          </button>
          {buildings.map((building) => (
            <button
              key={building._id}
              style={{
                ...styles.categoryButton,
                ...(selectedBuildingFilter === building._id ? styles.activeCategoryButton : {})
              }}
              onClick={() => setSelectedBuildingFilter(building._id)}
            >
              {building.name}
            </button>
          ))}
        </div>

        {/* Floor Buttons */}
        {selectedBuildingFilter && (
          <div style={styles.floorButtons}>
            <button
              style={{
                ...styles.floorButton,
                ...(selectedFloorFilter === "" ? styles.activeFloorButton : {})
              }}
              onClick={() => setSelectedFloorFilter("")}
            >
              All Floors
            </button>
            {Array.from({ length: buildings.find(b => b._id === selectedBuildingFilter)?.floors || 0 }, (_, i) => (
              <button
                key={i + 1}
                style={{
                  ...styles.floorButton,
                  ...(selectedFloorFilter === (i + 1).toString() ? styles.activeFloorButton : {})
                }}
                onClick={() => setSelectedFloorFilter((i + 1).toString())}
              >
                Floor {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Add/Edit form */}
        {showForm && (
          <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>{editingId ? "Edit Hall" : "Add New Hall"}</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hall Name</label>
                <input
                  type="text"
                  placeholder="Enter hall name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Building</label>
                <select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option value="">Select Building</option>
                  {buildings.map((building) => (
                    <option key={building._id} value={building._id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Floor</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option value="">Select Floor</option>
                  {getFloorOptions().map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Capacity</label>
                <input
                  type="number"
                  placeholder="Enter capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  min="1"
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hall Image</label>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  accept="image/*"
                  style={styles.input}
                />
              </div>
              <button
                type="submit"
                style={{ ...styles.button, ...styles.primaryButton }}
                disabled={loading}
              >
                {loading ? "Saving..." : (editingId ? "Update Hall" : "Add Hall")}
              </button>
            </form>
          </div>
        )}

        {/* Halls grid */}
        {filteredHalls.length === 0 ? (
          <div style={styles.emptyState}>
            {searchQuery || selectedBuildingFilter || selectedFloorFilter 
              ? "No halls match your criteria" 
              : "No halls found. Add a hall to get started."}
          </div>
        ) : (
          <div style={styles.hallsGrid}>
            {filteredHalls.map((hall) => (
              <div key={hall._id} style={styles.hallCard}>
                {hall.image && (
                  <img
                    src={`http://localhost:8070${hall.image}`}
                    alt={hall.name}
                    style={styles.hallImage}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x200?text=Hall+Image";
                    }}
                  />
                )}
                <div style={styles.hallContent}>
                  <h3 style={styles.hallName}>{hall.name}</h3>
                  <p style={styles.hallDetails}>
                    <FaBuilding /> {hall.building?.name || "N/A"}
                  </p>
                  <p style={styles.hallDetails}>
                    <FaLayerGroup /> Floor {hall.floor}
                  </p>
                  <p style={styles.hallDetails}>
                    <FaUsers /> Capacity: {hall.capacity}
                  </p>
                  <div style={styles.cardActions}>
                    <button
                      style={{ ...styles.cardButton, ...styles.editButton }}
                      onClick={() => handleEdit(hall)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      style={{ ...styles.cardButton, ...styles.deleteButton }}
                      onClick={() => handleDelete(hall._id)}
                      disabled={loading}
                    >
                      <FaTrash /> {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HallForm;