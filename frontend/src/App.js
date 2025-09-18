import React, { useState, useEffect } from 'react';

function App() {
  const [page, setPage] = useState('shortener');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [links, setLinks] = useState([{ url: '', validity: 30, shortcode: '' }]);
  const [stats, setStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const handleAddLink = () => {
    if (links.length < 5) setLinks([...links, { url: '', validity: 30, shortcode: '' }]);
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleShortenAll = async () => {
    setError('');
    const newResults = [];
    for (const link of links) {
      if (!link.url) continue;
      try {
        const res = await fetch('http://localhost:5001/shorturls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: link.url,
            validity: parseInt(link.validity),
            shortcode: link.shortcode || undefined
          })
        });
        const data = await res.json();
        if (res.ok) {
          newResults.push(data);
        } else {
          setError(data.error);
          break;
        }
      } catch {
        setError('Failed to shorten one or more URLs');
        break;
      }
    }
    if (newResults.length > 0) {
      setResults([...results, ...newResults]);
      setLinks([{ url: '', validity: 30, shortcode: '' }]);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5001/shorturls');
      const data = await res.json();
      console.log('Fetched stats data:', data);
      if (Array.isArray(data)) {
        setStats(data);
      } else {
        setError('Invalid data format received for stats');
        setStats([]);
      }
    } catch {
      setError('Failed to fetch stats');
      setStats([]);
    }
    setLoadingStats(false);
  };

  useEffect(() => {
    if (page === 'stats') fetchStats();
  }, [page]);

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>URL Shortener</h2>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setPage('shortener')}
          style={{
            marginRight: 10,
            backgroundColor: page === 'shortener' ? '#1976d2' : '#fff',
            color: page === 'shortener' ? '#fff' : '#000',
            border: '1px solid #1976d2',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          Shortener
        </button>
        <button
          onClick={() => setPage('stats')}
          style={{
            backgroundColor: page === 'stats' ? '#1976d2' : '#fff',
            color: page === 'stats' ? '#fff' : '#000',
            border: '1px solid #1976d2',
            padding: '6px 12px',
            cursor: 'pointer'
          }}
        >
          Statistics
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      {page === 'shortener' && (
        <>
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={handleAddLink}
              disabled={links.length >= 5}
              style={{ padding: '6px 12px', cursor: 'pointer' }}
            >
              Add Link
            </button>
          </div>

          {links.map((link, index) => (
            <div key={index} style={{ marginBottom: 15, padding: 10, border: '1px solid #ccc' }}>
              <div>
                <label>
                  Original URL*:
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    required
                    style={{ width: '100%', padding: 6, marginTop: 4 }}
                  />
                </label>
              </div>
              <div style={{ marginTop: 8 }}>
                <label>
                  Validity (minutes):
                  <input
                    type="number"
                    value={link.validity}
                    onChange={(e) => handleLinkChange(index, 'validity', e.target.value)}
                    style={{ width: 100, padding: 6, marginLeft: 8 }}
                  />
                </label>
                <label style={{ marginLeft: 20 }}>
                  Custom Shortcode (optional):
                  <input
                    type="text"
                    value={link.shortcode}
                    onChange={(e) => handleLinkChange(index, 'shortcode', e.target.value)}
                    style={{ width: 150, padding: 6, marginLeft: 8 }}
                  />
                </label>
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => handleRemoveLink(index)}
                  style={{ backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div>
            <button
              onClick={handleShortenAll}
              disabled={!links.some(l => l.url)}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff', border: 'none' }}
            >
              Shorten All
            </button>
          </div>

          {results.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3>Recent Shortened URLs</h3>
              {results.map((r, i) => (
                <div key={i} style={{ padding: 8, border: '1px solid #ccc', marginBottom: 8 }}>
                  <div>
                    Short Link: <a href={r.shortLink} target="_blank" rel="noopener noreferrer">{r.shortLink}</a>
                  </div>
                  <div>Expires: {new Date(r.expiry).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {page === 'stats' && (
        <div>
          <h3>URL Statistics</h3>
          {loadingStats && <p>Loading statistics...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loadingStats && !error && stats.length === 0 && <p>No statistics available.</p>}
          {!loadingStats && !error && stats.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Shortcode</th>
                  <th style={{ border: '1px solid #ccc', padding: 8, wordBreak: 'break-word', maxWidth: 300 }}>Original URL</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Clicks</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.shortcode}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, wordBreak: 'break-word', maxWidth: 300 }}>
                      <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-word' }}>{item.originalUrl}</a>
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{item.clicks || 0}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(item.expiry).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

