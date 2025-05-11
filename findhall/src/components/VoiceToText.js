import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const VoiceToText = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
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
        setTranscript(transcript);
        onSearch(transcript);
      };

      recognition.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSearch]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not initialized');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError(`Error starting recognition: ${err.message}`);
      }
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    },
    button: {
      backgroundColor: isListening ? '#e53e3e' : '#3182ce',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    transcript: {
      marginTop: '10px',
      padding: '10px',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      minWidth: '200px',
      textAlign: 'center',
    },
    error: {
      color: 'red',
      marginTop: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.button}
        onClick={toggleListening}
        title={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
      </button>
      {transcript && <div style={styles.transcript}>{transcript}</div>}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

export default VoiceToText; 