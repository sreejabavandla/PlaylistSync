import { useEffect, useState } from 'react';
import PlaylistVideos from './Components/PlaylistVideos';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      setLoading(true);

      fetch("http://localhost:5000/api/youtube/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Access Token (Frontend):", data.access_token); // check here
          setAccessToken(data.access_token); // make sure this is defined
          setPlaylists(data.items || []);
        })

        .catch((err) => {
          console.error("Failed to fetch playlist:", err);
          setLoading(false);
        });
    }
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/api/youtube/login";
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🎵 PlaylistSync - YouTube</h1>

      {!playlists.length && !loading && (
        <button onClick={handleLogin}>Login with Google</button>
      )}

      {loading && <p>Loading playlists...</p>}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '2rem',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
      >
        {playlists.map((pl) => (
          <div
            key={pl.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              width: '200px',
              cursor: 'pointer',
              background: '#f9f9f9'
            }}
            onClick={() => alert(`Clicked: ${pl.snippet.title}`)}
          >
            <img
              src={pl.snippet.thumbnails.default.url}
              alt={pl.snippet.title}
              style={{ width: '100%', borderRadius: '4px' }}
            />
            <p>{pl.snippet.title}</p>
          </div>
        ))}
        {selectedPlaylistId && accessToken && (
          <PlaylistVideos playlistId={selectedPlaylistId} accessToken={accessToken} />
        )}
      </div>


    </div>

  );
}

export default App;
