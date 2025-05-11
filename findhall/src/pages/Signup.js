import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username || !email || !password) {
      setError('All fields are required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:8070/api/users/signup', {
        name: username,
        email,
        password,
      });

      alert('Signup successful');
      navigate('/login');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response) {
        setError(err.response.data.msg || 'Server error occurred');
      } else if (err.request) {
        setError('No response from server. Please check if the server is running.');
      } else {
        setError('Error setting up the request: ' + err.message);
      }
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.backgroundOverlay}></div>
      <nav style={styles.nav}>
        <Link to="/findmyhall" style={styles.homeLink}>
          <span style={styles.homeIcon}>🏠</span> Home
        </Link>
      </nav>
      
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Get started by creating your account</p>
          </div>
          
          {error && <div style={styles.errorAlert}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
                placeholder="Enter your username"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
                placeholder="••••••••"
              />
              <p style={styles.passwordHint}>Must be at least 6 characters</p>
            </div>
            
            <button type="submit" style={styles.button}>
              Create Account
            </button>
          </form>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" style={styles.footerLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundImage: 'url(https://www.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 0,
  },
  nav: {
    backgroundColor: 'transparent',
    padding: '20px 40px',
    position: 'relative',
    zIndex: 2,
  },
  homeLink: {
    textDecoration: 'none',
    color: 'white',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  homeIcon: {
    fontSize: '20px',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
    minHeight: 'calc(100vh - 80px)',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    padding: '48px',
    width: '100%',
    maxWidth: '450px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  header: {
    marginBottom: '36px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#666',
    margin: '0',
    fontWeight: '400',
  },
  form: {
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxSizing: 'border-box',
  },
  passwordHint: {
    fontSize: '12px',
    color: '#666',
    margin: '8px 0 0',
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '12px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '24px',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    color: '#666',
    fontSize: '14px',
    margin: '0',
  },
  footerLink: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '24px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
};

export default Signup;