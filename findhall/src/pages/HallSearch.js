import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const HallSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            setError('');
            console.log('Sending search request for:', searchQuery);
            
            const response = await axios.get(`http://localhost:8070/hall/search`, {
                params: { query: searchQuery },
                timeout: 5000 // 5 second timeout
            });
            
            console.log('Search response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setSearchResults(response.data);
            } else {
                console.error('Invalid response format:', response.data);
                setError('Invalid response format from server');
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Detailed search error:', err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Server response error:', err.response.data);
                setError(`Server error: ${err.response.data.error || err.response.data.message || 'Unknown error'}`);
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
                setError('No response from server. Please check if the server is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Request setup error:', err.message);
                setError(`Error: ${err.message}`);
            }
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
        },
        searchContainer: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
        },
        searchInput: {
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
        },
        searchButton: {
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        resultsContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
        },
        hallCard: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        hallName: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        hallDetails: {
            color: '#666',
            marginBottom: '5px',
        },
        errorMessage: {
            color: 'red',
            marginBottom: '20px',
        },
        loadingMessage: {
            textAlign: 'center',
            margin: '20px 0',
        },
        noResults: {
            textAlign: 'center',
            color: '#666',
            margin: '20px 0',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search halls by name or building..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={styles.searchInput}
                />
                <button onClick={handleSearch} style={styles.searchButton}>
                    <FaSearch /> Search
                </button>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    {error}
                    <button 
                        onClick={() => setError('')} 
                        style={{ 
                            marginLeft: '10px', 
                            padding: '5px 10px',
                            backgroundColor: '#ffebee',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {loading ? (
                <div style={styles.loadingMessage}>Searching...</div>
            ) : searchResults.length > 0 ? (
                <div style={styles.resultsContainer}>
                    {searchResults.map((hall) => (
                        <div key={hall._id} style={styles.hallCard}>
                            <h3 style={styles.hallName}>{hall.name}</h3>
                            <p style={styles.hallDetails}>
                                Building: {hall.building?.name || 'N/A'}
                            </p>
                            <p style={styles.hallDetails}>
                                Floor: {hall.floor}
                            </p>
                            <p style={styles.hallDetails}>
                                Capacity: {hall.capacity}
                            </p>
                            {hall.image && (
                                <img
                                    src={`http://localhost:8070${hall.image}`}
                                    alt={hall.name}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ) : searchQuery && !loading ? (
                <div style={styles.noResults}>No halls found matching your search.</div>
            ) : null}
        </div>
    );
};

export default HallSearch; 