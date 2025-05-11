import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const AnnouncementList = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch announcements from the backend
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    setLoading(true);
    axios
      .get("http://localhost:8070/announce")
      .then((response) => {
        setAnnouncements(response.data);
        setLoading(false);
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching announcements:", err);
        setError("Error fetching announcements. Please try again later.");
        setLoading(false);
      });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Styles for the component and navbar
  const styles = {
    container: {
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      padding: "0",
      margin: "0",
    },
    header: {
      backgroundColor: "#1f2937",
      padding: "1.5rem 2rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    headerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      color: "white",
      fontSize: "1.5rem",
      fontWeight: "600",
      margin: 0,
      cursor: "pointer",
      textDecoration: "none",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
    },
    welcomeText: {
      color: "#e5e7eb",
      fontSize: "1rem",
    },
    adminButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease',
    },
    logoutButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s ease',
    },
    mainContent: {
      maxWidth: "1200px",
      margin: "2rem auto",
      padding: "0 2rem",
    },
    heading: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#1f2937",
    },
    announcementItem: {
      borderBottom: "1px solid #ddd",
      padding: "15px",
      marginBottom: "10px",
      backgroundColor: "#f9f9f9",
      borderRadius: "5px",
    },
    announcementTitle: {
      fontSize: "18px",
      color: "#333",
      marginBottom: "5px",
    },
    announcementDate: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "10px",
    },
    errorMessage: {
      color: "red",
      marginBottom: "10px",
      padding: "10px",
      backgroundColor: "#ffebee",
      borderRadius: "4px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/" style={styles.headerTitle}>
            Find My Hall
          </Link>
          <div style={styles.headerRight}>
            <span style={styles.welcomeText}>
              Welcome, {user?.name || 'Guest'}
            </span>
            {user?.role === 'admin' && (
              <Link to="/adminpanel" style={styles.adminButton}>
                Admin Panel
              </Link>
            )}
            <button 
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={styles.mainContent}>
        <h2 style={styles.heading}>Announcements</h2>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            {announcements.map((announcement) => (
              <div key={announcement._id} style={styles.announcementItem}>
                <h3 style={styles.announcementTitle}>{announcement.announce}</h3>
                <p style={styles.announcementDate}>
                  {new Date(announcement.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementList;
