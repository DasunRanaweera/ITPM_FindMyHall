import React, { useState } from "react";
import { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import { Link } from "react-router-dom";

// CSS styles
const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
  },
  homeLink: {
    textDecoration: "none",
    color: "white",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
  },
  homeIcon: {
    marginRight: "8px",
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    margin: "0",
    backgroundColor: "#f4f4f4",
  },
  voiceSearchContainer: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    width: "100%",
  },
  microphoneIcon: {
    fontSize: "80px",
    color: "#007bff",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out",
  },
  microphoneIconActive: {
    transform: "scale(1.1)",
  },
  searchInput: {
    width: "80%",
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  statusMessage: {
    marginTop: "10px",
    fontStyle: "italic",
    color: "gray",
  },
  searchResults: {
    marginTop: "20px",
    textAlign: "left",
  },
};

const VoiceToText = () => {
  const { transcript, listening, resetTranscript, startListening, stopListening } =
    useSpeechRecognition();
  const [query, setQuery] = useState("");

  const saveText = async () => {
    if (transcript) {
      try {
        await axios.post("http://localhost:8070/voice/save", { text: transcript });
        alert("Text saved successfully!");
        resetTranscript();
      } catch (error) {
        console.error("Error saving text", error);
      }
    }
  };

  const handleMicClick = () => {
    startListening();
  };

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={styles.homeLink}>
          <span style={styles.homeIcon}>🏠</span> Home
        </Link>
      </nav>

      <div style={styles.container}>
        <div style={styles.voiceSearchContainer}>
          <h1>Voice Search</h1>
          <input
            type="text"
            id="search-input"
            placeholder="Type your search here..."
            style={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <i
            className="fas fa-microphone microphone-icon"
            style={{
              ...styles.microphoneIcon,
              ...(listening ? styles.microphoneIconActive : {}),
            }}
            onClick={handleMicClick}
          ></i>
          <div style={styles.statusMessage}>
            {listening ? "Listening..." : "Click the microphone to start voice search."}
          </div>
          <div style={styles.searchResults}>
            <p>{transcript ? `Search query: ${transcript}` : "No search made yet"}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceToText;
