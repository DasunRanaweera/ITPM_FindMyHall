import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaMicrophone, FaBullhorn, FaPen, FaUsers, FaSearch, FaMicrophoneSlash, FaBuilding, FaLayerGroup } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useAuth } from '../context/AuthContext';

const FindMyHall = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Initialize the speech recognition if available
  useEffect(() => {
    try {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setError('');
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          debouncedSearch(transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition. Please try again later.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
    };
  }, []);

  // Function to toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not initialized. Please refresh the page and try again.');
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Error toggling speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  // Search function
  const searchHalls = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(`http://localhost:8070/hall/search`, {
        params: { query },
        timeout: 5000,
      });

      if (response.data && Array.isArray(response.data)) {
        setSearchResults(response.data);
      } else {
        setError("Invalid response format from server");
        setSearchResults([]);
      }
    } catch (err) {
      if (err.response) {
        setError(`Server error: ${err.response.data.error || err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        setError("No response from server. Please check if the server is running.");
      } else {
        setError(`Error: ${err.message}`);
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(searchHalls, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle search button click
  const handleSearch = () => {
    searchHalls(searchQuery);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const styles = {
    pageContainer: {
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      backgroundImage: 'url(https://www.sliit.lk/wp-content/uploads/2018/03/SLIIT-malabe.jpg)',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
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
    header: {
      backgroundColor: "rgba(31, 41, 55, 0.9)",
      padding: "1.5rem 2rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      backdropFilter: "blur(8px)",
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
      backgroundColor: "rgba(76, 175, 80, 0.9)",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      border: "none",
      textDecoration: "none",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#45a049",
      },
    },
    logoutButton: {
      backgroundColor: "rgba(239, 68, 68, 0.9)",
      color: "white",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.5rem",
      fontSize: "1rem",
      fontWeight: "500",
      cursor: "pointer",
      border: "none",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#dc2626",
      },
    },
    mainContent: {
      maxWidth: "1200px",
      margin: "2rem auto",
      padding: "0 2rem",
    },
    searchSection: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "2.5rem",
      borderRadius: "1rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      marginBottom: "2rem",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    searchTitle: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "1.5rem",
      textAlign: "center",
    },
    searchBar: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    searchInput: {
      flex: 1,
      padding: "1rem 1.5rem",
      borderRadius: "0.75rem",
      border: "1px solid #e5e7eb",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      ":focus": {
        borderColor: "#3b82f6",
        outline: "none",
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)",
      },
    },
    searchButton: {
      backgroundColor: "#3b82f6",
      color: "white",
      padding: "1rem 1.5rem",
      borderRadius: "0.75rem",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      transition: "all 0.3s ease",
      ":hover": {
        backgroundColor: "#2563eb",
        transform: "translateY(-1px)",
      },
    },
    voiceButton: {
      backgroundColor: isListening ? "#ef4444" : "#3b82f6",
      color: "white",
      padding: "1rem",
      borderRadius: "0.75rem",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      ":hover": {
        backgroundColor: isListening ? "#dc2626" : "#2563eb",
        transform: "translateY(-1px)",
      },
    },
    resultsContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      padding: "2rem",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    resultItem: {
      padding: "1.5rem",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      ":hover": {
        backgroundColor: "rgba(248, 250, 252, 0.8)",
      },
    },
    resultTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "0.75rem",
    },
    resultDetails: {
      color: "#4b5563",
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      fontSize: "1rem",
    },
    resultImage: {
      width: "100%",
      maxWidth: "300px",
      height: "auto",
      maxHeight: "200px",
      borderRadius: "0.75rem",
      marginTop: "1rem",
      objectFit: "cover",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
    dismissButton: {
      backgroundColor: "transparent",
      border: "none",
      color: "#b91c1c",
      cursor: "pointer",
      padding: "0.5rem",
      borderRadius: "0.25rem",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#fecaca",
      },
    },
    loadingMessage: {
      textAlign: "center",
      padding: "2rem",
      color: "#4b5563",
      fontSize: "1.25rem",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderRadius: "0.75rem",
    },
    buttonsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      marginTop: "2rem",
      width: "100%",
    },
    actionButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      fontSize: "1.125rem",
      fontWeight: "600",
      borderRadius: "0.75rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
      color: "white",
      border: "none",
      width: "100%",
      ":hover": {
        transform: "translateY(-3px)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      },
    },
    icon: {
      marginRight: "1rem",
      fontSize: "1.25rem",
    },
    purpleButton: {
      backgroundColor: "rgba(155, 77, 224, 0.9)",
      ":hover": {
        backgroundColor: "#7c3aed",
      },
    },
    blueButton: {
      backgroundColor: "rgba(66, 153, 225, 0.9)",
      ":hover": {
        backgroundColor: "#3182ce",
      },
    },
    grayButton: {
      backgroundColor: "rgba(226, 232, 240, 0.9)",
      color: "#1f2937",
      ":hover": {
        backgroundColor: "#cbd5e0",
      },
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.overlay}></div>
      <div style={styles.contentWrapper}>
        {/* Header Section */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>Find My Hall</h1>
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

        <main style={styles.mainContent}>
          {/* Search Section */}
          <section style={styles.searchSection}>
            <h2 style={styles.searchTitle}>Find Your Perfect Hall</h2>
            <div style={styles.searchBar}>
              <input
                type="text"
                placeholder="Search by hall name or building name..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                style={styles.searchInput}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleSearch}
                  style={styles.searchButton}
                >
                  <FaSearch /> Search
                </button>
                <button
                  onClick={toggleListening}
                  style={styles.voiceButton}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                  disabled={!recognitionRef.current}
                >
                  {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
              </div>
            </div>
            {error && (
              <div style={styles.errorMessage}>
                {error}
                <button 
                  onClick={() => setError('')} 
                  style={styles.dismissButton}
                >
                  Dismiss
                </button>
              </div>
            )}
          </section>

          {/* Search Results */}
          {loading ? (
            <div style={styles.loadingMessage}>Searching for halls...</div>
          ) : searchResults.length > 0 ? (
            <div style={styles.resultsContainer}>
              {searchResults.map((hall) => (
                <div 
                  key={hall._id} 
                  style={styles.resultItem}
                >
                  <h3 style={styles.resultTitle}>{hall.name}</h3>
                  <p style={styles.resultDetails}>
                    <FaBuilding /> Building: {hall.building?.name || 'N/A'}
                  </p>
                  <p style={styles.resultDetails}>
                    <FaLayerGroup /> Floor: {hall.floor || 'N/A'}
                  </p>
                  <p style={styles.resultDetails}>
                    <FaUsers /> Capacity: {hall.capacity || 'N/A'}
                  </p>
                  {hall.image && (
                    <img
                      src={`http://localhost:8070${hall.image}`}
                      alt={hall.name}
                      style={styles.resultImage}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery && !loading ? (
            <div style={styles.resultsContainer}>
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div style={styles.buttonsContainer}>
            <Link to="/announcement" style={{ textDecoration: 'none', width: '100%' }}>
              <button
                style={{ ...styles.actionButton, ...styles.blueButton }}
              >
                <FaBullhorn style={styles.icon} /> Announcements
              </button>
            </Link>
            <Link to="/feedbackform" style={{ textDecoration: 'none', width: '100%' }}>
              <button
                style={{ ...styles.actionButton, ...styles.grayButton }}
              >
                <FaPen style={styles.icon} /> Feedback Corner
              </button>
            </Link>
            <Link to="/aboutus" style={{ textDecoration: 'none', width: '100%' }}>
              <button
                style={{ ...styles.actionButton, ...styles.purpleButton }}
              >
                <FaUsers style={styles.icon} /> About Us
              </button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FindMyHall;