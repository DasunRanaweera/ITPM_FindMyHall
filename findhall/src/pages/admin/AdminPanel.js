import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, NavLink, Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';

const AdminPanel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [announce, setAnnounce] = useState("");
  const [date, setDate] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ announce: "", date: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAnnouncements(announcements);
    } else {
      const filtered = announcements.filter(announcement =>
        announcement.announce.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAnnouncements(filtered);
    }
  }, [searchQuery, announcements]);

  const fetchAnnouncements = () => {
    setLoading(true);
    axios.get("http://localhost:8070/announce")
      .then((response) => {
        setAnnouncements(response.data || []);
        setFilteredAnnouncements(response.data || []);
        setError("");
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
        setError("Error fetching announcements. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    setLoading(true);
    const newAnnouncement = { announce, date };

    axios.post("http://localhost:8070/announce/add", newAnnouncement)
      .then((response) => {
        setAnnouncements([...announcements, response.data.announcement]);
        setAnnounce("");
        setDate("");
        setError("");
      })
      .catch((error) => {
        console.error("Error adding announcement:", error);
        setError("Error adding announcement. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setEditFormData({
      announce: announcement.announce,
      date: new Date(announcement.date).toISOString().split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const response = await axios.put(
        `http://localhost:8070/announce/update/${editingAnnouncement._id}`,
        editFormData
      );

      if (response.data) {
        setShowEditModal(false);
        fetchAnnouncements();
        setError("");
      }
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError(err.response?.data?.error || "Error updating announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Announcement Management Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = announcements.map(announcement => [
      announcement.announce,
      new Date(announcement.date).toLocaleDateString()
    ]);

    // Add table using autoTable
    autoTable(doc, {
      head: [['Announcement', 'Date']],
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

    // Save the PDF
    doc.save('announcement-management-report.pdf');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setLoading(true);
      axios.delete(`http://localhost:8070/announce/delete/${id}`)
        .then(() => {
          setAnnouncements(announcements.filter((item) => item._id !== id));
          setError("");
        })
        .catch((error) => {
          console.error("Error deleting announcement:", error);
          setError("Error deleting announcement. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  };

  const styles = {
    container: {
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#f0f2f5",
      padding: "30px",
      minHeight: "100vh",
      backgroundImage: 'url(https://www.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg)',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    },
    nav: {
      backgroundColor: "#1f2937",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "30px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    },
    navHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    navTitle: {
      color: "white",
      fontSize: "20px",
      fontWeight: "bold",
      margin: 0
    },
    navList: {
      listStyle: "none",
      display: "flex",
      gap: "20px",
      margin: 0,
      padding: 0
    },
    navLink: {
      color: "#f3f4f6",
      textDecoration: "none",
      fontWeight: "500",
      padding: "6px 12px",
      borderRadius: "6px",
      transition: "background-color 0.2s ease"
    },
    activeNavLink: {
      backgroundColor: "#374151"
    },
    heading: {
      fontSize: "2rem",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: "30px",
      color: "#1f2937"
    },
    form: {
      backgroundColor: "#ffffff",
      padding: "25px",
      borderRadius: "10px",
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
      marginBottom: "40px"
    },
    input: {
      width: "100%",
      padding: "12px",
      margin: "12px 0",
      borderRadius: "6px",
      border: "1px solid #cbd5e1",
      fontSize: "16px"
    },
    button: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "500",
      margin: "8px 4px"
    },
    addButton: { backgroundColor: "#3b82f6", color: "#fff" },
    updateButton: { backgroundColor: "#facc15", color: "#000" },
    deleteButton: { backgroundColor: "#ef4444", color: "#fff" },
    pdfButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      marginBottom: '20px',
    },
    announcementList: { listStyle: "none", padding: 0 },
    announcementItem: {
      backgroundColor: "#ffffff",
      padding: "20px",
      marginBottom: "20px",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    },
    modal: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      zIndex: 1000,
      width: "400px",
      maxWidth: "90%"
    },
    modalOverlay: {
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 999
    },
    errorMessage: {
      color: "#b91c1c",
      backgroundColor: "#fee2e2",
      borderRadius: "6px",
      padding: "12px",
      marginBottom: "20px"
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navHeader}>
          <h1 style={styles.navTitle}>Admin Panel</h1>
          <ul style={styles.navList}>
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

      <h1 style={styles.heading}>Announcement Management</h1>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            ...styles.button,
            ...styles.addButton,
            marginBottom: '20px'
          }}
        >
          {showForm ? 'Hide Form' : 'Add New Announcement'}
        </button>
        <button
          onClick={generatePDF}
          style={styles.pdfButton}
        >
          <FaFilePdf /> Generate PDF
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddAnnouncement} style={styles.form}>
          <input
            type="text"
            placeholder="Enter announcement"
            value={announce}
            onChange={(e) => setAnnounce(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split("T")[0]}
            style={styles.input}
            disabled={loading}
          />
          <button
            type="submit"
            style={{ ...styles.button, ...styles.addButton }}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Announcement"}
          </button>
        </form>
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.input}
        />
      </div>

      <h2 style={styles.heading}>Existing Announcements</h2>
      {loading ? (
        <div>Loading announcements...</div>
      ) : (
        <ul style={styles.announcementList}>
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <li key={announcement._id} style={styles.announcementItem}>
                <h3>{announcement.announce}</h3>
                <p>{new Date(announcement.date).toLocaleString()}</p>
                <button
                  onClick={() => handleEdit(announcement)}
                  style={{ ...styles.button, ...styles.updateButton }}
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  style={{ ...styles.button, ...styles.deleteButton }}
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p>No announcements found</p>
          )}
        </ul>
      )}

      {showEditModal && (
        <>
          <div style={styles.modalOverlay} onClick={() => { setShowEditModal(false); setError(""); }} />
          <div style={styles.modal}>
            <h2>Edit Announcement</h2>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="announce"
                value={editFormData.announce}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <input
                type="date"
                name="date"
                value={editFormData.date}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="submit" style={{ ...styles.button, ...styles.addButton }}>
                  {loading ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.deleteButton }}
                  onClick={() => { setShowEditModal(false); setError(""); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
