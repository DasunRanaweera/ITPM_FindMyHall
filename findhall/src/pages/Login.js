import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      // Check if user is admin
      if (email === 'Admin01@gmail.com' && password === 'admin01') {
        navigate('/adminpanel');
      } else {
        navigate('/findmyhall');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      
      
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>Please enter your details to sign in</p>
          </div>
          
          {error && <div style={styles.errorAlert}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
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
            </div>
            
            <button type="submit" style={styles.button}>
              Sign In
            </button>
          </form>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/signup" style={styles.footerLink}>
                Sign up
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
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    backgroundImage: 'url(https://www.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg)',
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
  homeLinkHover: {
    opacity: 0.8,
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
  inputFocus: {
    outline: 'none',
    borderColor: '#6366f1',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
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
  buttonHover: {
    backgroundColor: '#4f46e5',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
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
  footerLinkHover: {
    color: '#4f46e5',
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

export default Login;