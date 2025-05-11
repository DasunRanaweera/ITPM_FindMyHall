import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, Link } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';

const FeedbackPanel = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8070/feedback");
      setFeedbacks(response.data || []);
      setError("");
    } catch (err) {
      setError("Error fetching feedbacks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Feedback Management Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = feedbacks.map(feedback => [
      feedback.name,
      feedback.feedback,
      new Date(feedback.date).toLocaleDateString()
    ]);

    // Add table using autoTable
    autoTable(doc, {
      head: [['Name', 'Feedback', 'Date']],
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
    doc.save('feedback-management-report.pdf');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:8070/feedback/delete/${id}`);
        setFeedbacks(feedbacks.filter((item) => item._id !== id));
        setError("");
      } catch (err) {
        setError("Error deleting feedback. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const styles = {
    container: {
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#f0f2f5",
      padding: "30px",
      minHeight: "100vh"
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
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "white",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      borderRadius: "10px",
      overflow: "hidden"
    },
    th: {
      backgroundColor: "#f2f2f2",
      padding: "12px",
      textAlign: "left",
      borderBottom: "2px solid #ddd",
      fontWeight: "600"
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #ddd"
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
    errorMessage: {
      color: "#b91c1c",
      backgroundColor: "#fee2e2",
      borderRadius: "6px",
      padding: "12px",
      marginBottom: "20px"
    },
    loadingMessage: {
      textAlign: "center",
      padding: "20px",
      color: "#4b5563"
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navHeader}>
          <h2 style={styles.navTitle}>Admin Dashboard</h2>
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

      <h1 style={styles.heading}>Feedback Management</h1>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={generatePDF}
          style={styles.pdfButton}
        >
          <FaFilePdf /> Generate PDF
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingMessage}>Loading feedbacks...</div>
      ) : feedbacks.length === 0 ? (
        <p>No feedbacks available</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Feedback</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedbackItem) => (
              <tr key={feedbackItem._id}>
                <td style={styles.td}>{feedbackItem.name}</td>
                <td style={styles.td}>{feedbackItem.feedback}</td>
                <td style={styles.td}>
                  {new Date(feedbackItem.date).toLocaleString()}
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleDelete(feedbackItem._id)}
                    style={{ ...styles.button, ...styles.deleteButton }}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackPanel;
