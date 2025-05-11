import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaFilePdf, FaTimes, FaUserShield } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NavLink, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Redirect if not admin or moderator
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      navigate('/findmyhall');
    }
  }, [user, navigate]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8070/api/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery) ||
    user.email.toLowerCase().includes(searchQuery) ||
    user.role.toLowerCase().includes(searchQuery)
  );

  const handleEdit = (user) => {
    if (user.role !== 'admin') {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleUpdate = async (updatedUser) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:8070/api/users/update/${updatedUser._id}`, {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      });
      fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      setError('');
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error updating user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:8070/api/users/delete/${userId}`);
        fetchUsers();
        setError('');
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Error deleting user. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('User Management Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // Prepare table data
    const tableData = filteredUsers.map(user => [
      user.name,
      user.email,
      user.role
    ]);

    // Add table using autoTable
    autoTable(doc, {
      head: [['Name', 'Email', 'Role']],
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
    doc.save('user-management-report.pdf');
  };

  // Sort users to show admins first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  return (
    <div className="user-management">
      {/* Navbar */}
      <nav className="admin-nav">
        <div className="nav-content">
          <h2 className="nav-brand">Admin Dashboard</h2>
          <ul className="nav-links">
            <li><NavLink to="/adminpanel" className="nav-link" activeClassName="active">Announcement</NavLink></li>
            <li><NavLink to="/building" className="nav-link" activeClassName="active">Building</NavLink></li>
            <li><NavLink to="/hall" className="nav-link" activeClassName="active">Hall</NavLink></li>
            <li><Link to="/feedbackpanel" className="nav-link">Review</Link></li>
            <li><Link to="/usermanagement" className="nav-link">User Management</Link></li>
          </ul>
        </div>
      </nav>

      <main className="content">
        <header className="page-header">
          <div className="header-title">
            <FaUserShield className="header-icon" />
            <h1>User Management</h1>
          </div>
          <button onClick={generatePDF} className="pdf-btn">
            <FaFilePdf /> Export PDF
          </button>
        </header>

        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Loading users...</span>
          </div>
        ) : (
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((currentUser) => (
                  <tr key={currentUser._id} className={currentUser.role === 'admin' ? 'admin' : ''}>
                    <td>
                      <div className="user-info">
                        {currentUser.name}
                        {currentUser.role === 'admin' && <span className="admin-badge">Admin</span>}
                      </div>
                    </td>
                    <td>{currentUser.email}</td>
                    <td>
                      <span className={`role-tag ${currentUser.role}`}>
                        {currentUser.role}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td>
                        <div className="action-btns">
                          <button
                            onClick={() => handleEdit(currentUser)}
                            className="edit-btn"
                            disabled={currentUser.role === 'admin'}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(currentUser._id)}
                            className="delete-btn"
                            disabled={currentUser.role === 'admin'}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showEditModal && selectedUser && (
          <div className="modal">
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>Edit User</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="close-btn"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdate(selectedUser);
              }}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    required
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .user-management {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          background-color: #f8fafc;
          color: #1e293b;
        }

        /* Navbar */
        .admin-nav {
          background: #1e293b;
          padding: 1rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .nav-links {
          display: flex;
          list-style: none;
          gap: 1.5rem;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover, .active {
          color: white;
        }

        /* Main Content */
        .content {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 2rem;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .header-icon {
          color: #3b82f6;
          font-size: 1.5rem;
        }

        /* Search Bar */
        .search-bar {
          position: relative;
          margin-bottom: 1.5rem;
          max-width: 500px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          background-color: white;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Error Alert */
        .error-alert {
          background-color: #fee2e2;
          color: #b91c1c;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          border-left: 4px solid #b91c1c;
        }

        /* Loading */
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
          color: #64748b;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* User Table */
        .user-table-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
        }

        .user-table th {
          background-color: #f1f5f9;
          color: #64748b;
          font-weight: 600;
          text-align: left;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .user-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .user-table tr:last-child td {
          border-bottom: none;
        }

        .user-table tr:hover {
          background-color: #f8fafc;
        }

        .user-table tr.admin {
          background-color: #fef2f2;
        }

        .user-table tr.admin:hover {
          background-color: #fee2e2;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-badge {
          background-color: #fee2e2;
          color: #b91c1c;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-weight: 600;
        }

        .role-tag {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .role-tag.admin {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .role-tag.moderator {
          background-color: #dbeafe;
          color: #1d4ed8;
        }

        .role-tag.user {
          background-color: #dcfce7;
          color: #166534;
        }

        /* Action Buttons */
        .action-btns {
          display: flex;
          gap: 0.5rem;
        }

        .edit-btn, .delete-btn, .pdf-btn, .save-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-btn {
          background-color: #e0f2fe;
          color: #0369a1;
        }

        .edit-btn:hover {
          background-color: #bae6fd;
        }

        .edit-btn:disabled {
          background-color: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .delete-btn {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .delete-btn:hover {
          background-color: #fecaca;
        }

        .delete-btn:disabled {
          background-color: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .pdf-btn {
          background-color: #3b82f6;
          color: white;
          padding: 0.5rem 1rem;
          gap: 0.5rem;
        }

        .pdf-btn:hover {
          background-color: #2563eb;
        }

        /* Modal */
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-dialog {
          background-color: white;
          border-radius: 0.75rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1e293b;
        }

        .close-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 1.25rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #475569;
        }

        /* Form */
        form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #334155;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .save-btn {
          width: 100%;
          padding: 0.75rem;
          background-color: #3b82f6;
          color: white;
          font-weight: 500;
          margin-top: 0.5rem;
        }

        .save-btn:hover {
          background-color: #2563eb;
        }

        .save-btn:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;