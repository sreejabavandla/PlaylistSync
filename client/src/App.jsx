import { useEffect, useState } from 'react';
import PlaylistVideos from './Components/PlaylistVideos';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:5000/api/spotify/login";
  };



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("URL Params:", urlParams.toString());
    const code = urlParams.get("code");
    const source = urlParams.get("source");
    console.log("Parsed Code / Source:", code, source);

    if (!code) return;

    setLoading(true);

    if (source === 'spotify') {
      fetch("http://localhost:5000/api/spotify/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          console.log("Spotify Access Token:", data.access_token);
          setAccessToken(data.access_token);
          setPlaylists(data.items || []);
        })
        .catch(err => console.error("Spotify fetch failed", err));
    }


    else {
      fetch("http://localhost:5000/api/youtube/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("YouTube Access Token:", data.access_token);
          setAccessToken(data.access_token);
          setPlaylists(data.items || []);
        })
        .catch((err) => {
          console.error("YouTube fetch failed:", err);
          setLoading(false);
        });
    }
  }, []);


  useEffect(() => {
    // This one logs the selected playlist ID
    if (selectedPlaylistId) {
      console.log("Selected Playlist ID:", selectedPlaylistId);
    }
  }, [selectedPlaylistId]);

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/api/youtube/login";
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🎵 PlaylistSync - YouTube</h1>

      {!playlists.length && !loading && (
        <button onClick={handleLogin}>Login with Google</button>
      )}

      <button onClick={handleSpotifyLogin}>Login with Spotify</button>

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
            onClick={() => setSelectedPlaylistId(pl.id)}

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
