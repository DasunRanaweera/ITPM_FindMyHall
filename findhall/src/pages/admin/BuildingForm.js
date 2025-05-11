import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf, FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaBuilding, FaLayerGroup } from 'react-icons/fa';
// start
const BuildingForm = () => {
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [floors, setFloors] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [originalFloors, setOriginalFloors] = useState(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBuildings(buildings);
    } else {
      const filtered = buildings.filter(building =>
        building.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuildings(filtered);
    }
  }, [searchQuery, buildings]);

  const fetchBuildings = async () => {
    try {
      const res = await axios.get("http://localhost:8070/building");
      setBuildings(res.data);
      setFilteredBuildings(res.data);
    } catch (err) {
      console.error("Error fetching buildings:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      setError("Building name must contain only letters.");  // validating the name of the building
      return;
    }

    if (floors <= 0 || isNaN(floors)) {
      setError("Number of floors must be a positive number.");
      return;
    }

    if (editingId && originalFloors && floors < originalFloors) {
      setError(`Cannot decrease number of floors below ${originalFloors} as there may be halls on higher floors.`);
      return;
    }

    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("floors", floors);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await axios.put(`http://localhost:8070/building/update/${editingId}`, formData);
      } else {
        await axios.post("http://localhost:8070/building/add", formData);
      }
      setName("");
      setFloors("");
      setImage(null);
      setEditingId(null);
      setOriginalFloors(null);
      setShowForm(false);
      fetchBuildings();
    } catch (err) {
      console.error("Error saving building:", err);
      setError("Error saving building. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this building?")) {
      try {
        setLoading(true);
        const response = await axios.delete(`http://localhost:8070/building/delete/${id}`);
        
        if (response.status === 200) {
          setBuildings(prevBuildings => prevBuildings.filter(building => building._id !== id));
          setFilteredBuildings(prevBuildings => prevBuildings.filter(building => building._id !== id));
          setError("");
        }
      } catch (err) {
        console.error("Error deleting building:", err);
        setError(err.response?.data?.error || "Error deleting building. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (building) => {
    setName(building.name);
    setFloors(building.floors);
    setOriginalFloors(building.floors);
    setEditingId(building._id);
    setShowForm(true);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Building Management Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableData = buildings.map(building => [
      building.name,
      building.location,
      building.floors
    ]);

    autoTable(doc, {
      head: [['Building Name', 'Location', 'Number of Floors']],
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

    doc.save('building-management-report.pdf');
  };

  const styles = {
    pageContainer: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      backgroundImage: 'url(https://www.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg)',//image back url
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "0",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 0,
    },
    contentWrapper: {
      position: "relative",
      zIndex: 1,
    },
    nav: {
      backgroundColor: "rgba(31, 41, 55, 0.9)",
      padding: "1.5rem 2rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(8px)",
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
    },
    navLinkHover: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    activeNavLink: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    mainContent: {
      maxWidth: "1200px",
      margin: "2rem auto",
      padding: "0 2rem",
      position: "relative",
      zIndex: 1,
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
      color: "#ffffff",
      margin: 0,
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
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
    },
    primaryButtonHover: {
      backgroundColor: "#2563eb",
    },
    successButton: {
      backgroundColor: "#10b981",
      color: "white",
    },
    successButtonHover: {
      backgroundColor: "#059669",
    },
    dangerButton: {
      backgroundColor: "#ef4444",
      color: "white",
    },
    dangerButtonHover: {
      backgroundColor: "#dc2626",
    },
    formContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      padding: "2rem",
      marginBottom: "2rem",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
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
      backgroundColor: "rgba(255, 255, 255, 0.8)",
    },
    inputFocus: {
      borderColor: "#3b82f6",
      outline: "none",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
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
      backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    },
    clearSearchHover: {
      color: "#6b7280",
    },
    buildingsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    buildingCard: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      transition: "all 0.3s ease",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    buildingCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    },
    buildingImage: {
      width: "100%",
      height: "200px",
      objectFit: "cover",
    },
    buildingContent: {
      padding: "1.5rem",
    },
    buildingName: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "0.5rem",
    },
    buildingDetails: {
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
    },
    editButtonHover: {
      backgroundColor: "#f59e0b",
    },
    deleteButton: {
      backgroundColor: "#fef2f2",
      color: "#ef4444",
    },
    deleteButtonHover: {
      backgroundColor: "#fee2e2",
    },
    errorMessage: {
      backgroundColor: "rgba(254, 226, 226, 0.95)",
      color: "#b91c1c",
      padding: "1rem 1.5rem",
      borderRadius: "0.75rem",
      marginBottom: "1.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      border: "1px solid rgba(254, 202, 202, 0.8)",
    },
    emptyState: {
      textAlign: "center",
      padding: "2rem",
      color: "#6b7280",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      borderRadius: "0.75rem",
    },
    floorNote: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginTop: "0.5rem",
      fontStyle: "italic",
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.overlay}></div>
      <div style={styles.contentWrapper}>
        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <h1 style={styles.navTitle}>Admin Dashboard</h1>
            <ul style={styles.navLinks}>
              <li>
                <a href="http://localhost:3000/" style={styles.navLink}>Home</a>
              </li>
              <li>
                <NavLink to="/adminpanel" style={styles.navLink} activeStyle={styles.activeNavLink}>Announcement</NavLink>
              </li>
              <li>
                <NavLink to="/building" style={styles.navLink} activeStyle={styles.activeNavLink}>Building</NavLink>
              </li>
              <li>
                <NavLink to="/hall" style={styles.navLink} activeStyle={styles.activeNavLink}>Hall</NavLink>
              </li>
              <li>
                <Link to="/feedbackpanel" style={styles.navLink}>
                  Review
                </Link>
              </li>
              <li>
                <Link to="/usermanagement" style={styles.navLink}>
                  User Management
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div style={styles.mainContent}>
          {/* Header with actions */}
          <div style={styles.header}>
            <h2 style={styles.title}>Building Management</h2>
            <div style={styles.actionButtons}>
              <button
                style={{ ...styles.button, ...styles.successButton }}
                onClick={generatePDF}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.successButtonHover.backgroundColor}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.successButton.backgroundColor}
              >
                <FaFilePdf /> Generate PDF
              </button>
              <button
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={() => {
                  setShowForm(!showForm);
                  if (editingId) {
                    setName("");
                    setFloors("");
                    setImage(null);
                    setEditingId(null);
                    setOriginalFloors(null);
                  }
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.primaryButtonHover.backgroundColor}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.primaryButton.backgroundColor}
              >
                <FaPlus /> {showForm ? "Cancel" : "Add Building"}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={styles.errorMessage}>
              {error}
              <button 
                onClick={() => setError("")} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "0.25rem",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fecaca"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
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
              placeholder="Search buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              onFocus={e => e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow}
              onBlur={e => e.currentTarget.style.boxShadow = "none"}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={styles.clearSearch}
                onMouseEnter={e => e.currentTarget.style.color = styles.clearSearchHover.color}
                onMouseLeave={e => e.currentTarget.style.color = styles.clearSearch.color}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Add/Edit form */}
          {showForm && (
            <div style={styles.formContainer}>
              <h3 style={styles.formTitle}>{editingId ? "Edit Building" : "Add New Building"}</h3>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Building Name</label>
                  <input
                    type="text"
                    placeholder="Enter building name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                    onFocus={e => e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow}
                    onBlur={e => e.currentTarget.style.boxShadow = "none"}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Number of Floors</label>
                  <input
                    type="number"
                    placeholder="Enter number of floors"
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    required
                    min={originalFloors || 1}
                    style={styles.input}
                    onFocus={e => e.currentTarget.style.boxShadow = styles.inputFocus.boxShadow}
                    onBlur={e => e.currentTarget.style.boxShadow = "none"}
                  />
                  {editingId && (
                    <p style={styles.floorNote}>
                      Note: Cannot decrease number of floors below {originalFloors}
                    </p>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Building Image</label>
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
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.primaryButtonHover.backgroundColor}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.primaryButton.backgroundColor}
                >
                  {editingId ? "Update Building" : "Add Building"}
                </button>
              </form>
            </div>
          )}

          {/* Buildings grid */}
          {filteredBuildings.length === 0 ? (
            <div style={styles.emptyState}>
              {searchQuery ? "No buildings match your search" : "No buildings found"}
            </div>
          ) : (
            <div style={styles.buildingsGrid}>
              {filteredBuildings.map((building) => (
                <div 
                  key={building._id} 
                  style={styles.buildingCard}
                  onMouseEnter={e => e.currentTarget.style.transform = styles.buildingCardHover.transform}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  {building.image && (
                    <img
                      src={`http://localhost:8070${building.image}`}
                      alt={building.name}
                      style={styles.buildingImage}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x200?text=Building+Image";
                      }}
                    />
                  )}
                  <div style={styles.buildingContent}>
                    <h3 style={styles.buildingName}>{building.name}</h3>
                    <p style={styles.buildingDetails}>
                      <FaBuilding /> {building.location || "No location specified"}
                    </p>
                    <p style={styles.buildingDetails}>
                      <FaLayerGroup /> {building.floors} floor{building.floors !== 1 ? "s" : ""}
                    </p>
                    <div style={styles.cardActions}>
                      <button
                        style={{ ...styles.cardButton, ...styles.editButton }}
                        onClick={() => handleEdit(building)}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.editButtonHover.backgroundColor}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.editButton.backgroundColor}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        style={{ ...styles.cardButton, ...styles.deleteButton }}
                        onClick={() => handleDelete(building._id)}
                        disabled={loading}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.deleteButtonHover.backgroundColor}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.deleteButton.backgroundColor}
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
    </div>
  );
};

export default BuildingForm;