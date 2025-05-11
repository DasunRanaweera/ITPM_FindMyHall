import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FeedbackForm = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    feedback: ''
  });
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchFeedbacks();
    }
  }, [user, navigate]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      // If user is admin, fetch all feedbacks
      if (user.email === 'Admin01@gmail.com') {
        const response = await axios.get('http://localhost:8070/feedback');
        setFeedbacks(response.data);
      } else {
        // Fetch only user's feedbacks
        const response = await axios.get(`http://localhost:8070/feedback/user/${user.id}`);
        setFeedbacks(response.data);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Error fetching feedbacks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (selectedFeedbackId) {
        // Update existing feedback
        const response = await axios.put(`http://localhost:8070/feedback/update/${selectedFeedbackId}`, {
          ...formData,
          userId: user.id
        });
        setSuccess('Feedback updated successfully!');
        setSelectedFeedbackId(null);
      } else {
        // Add new feedback
        const response = await axios.post('http://localhost:8070/feedback/add', {
          ...formData,
          userId: user.id
        });
        setSuccess('Feedback submitted successfully!');
      }
      setFormData({
        name: '',
        feedback: ''
      });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError(error.response?.data?.error || 'Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, name, feedback) => {
    setSelectedFeedbackId(id);
    setFormData({
      name,
      feedback
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:8070/feedback/delete/${id}`);
        fetchFeedbacks();
        setError('');
      } catch (error) {
        console.error('Error deleting feedback:', error);
        setError('Error deleting feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      feedback: ''
    });
    setSelectedFeedbackId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const styles = {
    container: {
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      padding: '0',
      margin: '0',
    },
    header: {
      backgroundColor: '#1f2937',
      padding: '1.5rem 2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: 0,
      cursor: 'pointer',
      textDecoration: 'none',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    },
    welcomeText: {
      color: '#e5e7eb',
      fontSize: '1rem',
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
      maxWidth: '1200px',
      margin: '2rem auto',
      padding: '0 2rem',
    },
    title: {
      textAlign: 'center',
      color: '#1f2937',
      marginBottom: '20px',
      fontSize: '2rem',
      fontWeight: '600',
    },
    form: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#374151',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      minHeight: '150px',
      resize: 'vertical',
    },
    submitButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s ease',
    },
    submitButtonHover: {
      backgroundColor: '#2563eb',
    },
    success: {
      color: '#059669',
      backgroundColor: '#d1fae5',
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      textAlign: 'center',
    },
    error: {
      color: '#dc2626',
      backgroundColor: '#fee2e2',
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
      textAlign: 'center',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    th: {
      backgroundColor: '#f2f2f2',
      padding: '12px',
      textAlign: 'left',
      borderBottom: '2px solid #ddd',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #ddd',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
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
        <h2 style={styles.title}>Feedback Corner</h2>
        
        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={styles.input}
              required
              placeholder="Enter your name"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Feedback</label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              style={styles.textarea}
              required
              placeholder="Share your thoughts with us..."
            />
          </div>
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
            onMouseEnter={(e) => (e.target.style.backgroundColor = styles.submitButtonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = styles.submitButton.backgroundColor)}
          >
            {loading ? 'Submitting...' : selectedFeedbackId ? 'Update Feedback' : 'Submit Feedback'}
          </button>
          {selectedFeedbackId && (
            <button 
              type="button" 
              onClick={resetForm}
              style={{...styles.submitButton, backgroundColor: '#6B7280', marginTop: '10px'}}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div style={styles.mainContent}>
        <h2>My Feedbacks</h2>
        {loading ? (
          <div style={styles.loadingMessage}>Loading feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <p>No feedbacks available.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Feedback</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedbackItem) => (
                <tr key={feedbackItem._id}>
                  <td style={styles.td}>{feedbackItem.name}</td>
                  <td style={styles.td}>{feedbackItem.feedback}</td>
                  <td style={styles.td}>{new Date(feedbackItem.date).toLocaleString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(feedbackItem._id, feedbackItem.name, feedbackItem.feedback)}
                        style={styles.button}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(feedbackItem._id)}
                        style={{...styles.button, backgroundColor: '#dc3545'}}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
