import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8070/users");
      setUsers(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    // Prevent editing admin role
    if (user.role === 'admin') {
      setError("Cannot edit admin role");
      return;
    }
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleDelete = async (userId) => {
    // Prevent deleting Admin01 account
    const userToDelete = users.find(user => user._id === userId);
    if (userToDelete && userToDelete.email === 'Admin01@gmail.com') {
      setError("Cannot delete the main admin account");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:8070/users/delete/${userId}`);
        setUsers(users.filter((user) => user._id !== userId));
        setError("");
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Error deleting user. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Prevent updating to admin role
    if (editFormData.role === 'admin') {
      setError("Cannot set role to admin");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8070/users/update/${selectedUser._id}`,
        editFormData
      );
      setUsers(
        users.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      );
      setSelectedUser(null);
      setEditFormData({
        name: "",
        email: "",
        role: "user",
      });
      setError("");
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Error updating user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      backgroundColor: "#f3f4f6",
      padding: "1rem",
      textAlign: "left",
      fontWeight: "600",
      color: "#374151",
      borderBottom: "2px solid #e5e7eb",
    },
    td: {
      padding: "1rem",
      borderBottom: "1px solid #e5e7eb",
      color: "#4b5563",
    },
    adminRole: {
      color: '#dc2626',
      fontWeight: '600',
      backgroundColor: '#fee2e2',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '1rem',
      borderRadius: '0.375rem',
      marginBottom: '1rem',
    },
    editForm: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginTop: '2rem',
    },
    formGroup: {
      marginBottom: '1rem',
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
    select: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      backgroundColor: 'white',
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
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/" style={styles.headerTitle}>
            Find My Hall
          </Link>
          <div style={styles.headerRight}>
            <a href="http://localhost:3000/" style={styles.adminButton}>Home</a>
            <span style={styles.welcomeText}>Welcome, {user?.name || 'Guest'}</span>
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
        <h2 style={styles.heading}>User Management</h2>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      <span style={user.role === 'admin' ? styles.adminRole : {}}>
                        {user.role}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.email !== 'Admin01@gmail.com' && (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleEdit(user)}
                            style={styles.editButton}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            style={styles.deleteButton}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedUser && (
          <div style={styles.editForm}>
            <h3 style={styles.heading}>Edit User</h3>
            <form onSubmit={handleUpdate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  style={styles.select}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin" disabled>Admin</option>
                </select>
              </div>
              <button type="submit" style={styles.submitButton} disabled={loading}>
                {loading ? "Updating..." : "Update User"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
