import { useEffect, useState } from 'react';
import PlaylistVideos from './Components/PlaylistVideos';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [source, setSource] = useState(null);

  const handleSpotifyLogin = () => {
    window.location.href = "http://127.0.0.1:5000/api/spotify/login";
  };

  const handleLogin = () => {
    window.location.href = "http://127.0.0.1:5000/api/youtube/login";
  };
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  let source = urlParams.get("source");

  console.log("🔍 useEffect running");
  console.log("👉 code =", code);
  console.log("👉 source =", source);

  if (!code) {
    console.log("🚫 No code found, skipping token fetch.");
    return;
  }

  // Infer source if not passed
  if (!source) {
    const pathname = window.location.pathname;
    if (pathname === "/oauth2callback") {
      console.log("✅ Detected YouTube from /oauth2callback");
      source = "youtube";
    } else {
      console.log("✅ Defaulting to Spotify (assumed)");
      source = "spotify";
    }
  }

  setSource(source);
  setLoading(true);

  const fetchToken = async () => {
    try {
      console.log("🚀 Fetching token for", source);
      let response;

      if (source === "spotify") {
        response = await fetch("http://127.0.0.1:5000/api/spotify/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirect_uri: "http://127.0.0.1:5173" }),
        });
      } else {
        response = await fetch("http://127.0.0.1:5000/api/youtube/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
      }

      const data = await response.json();
      console.log("✅ Got data:", data);

      setAccessToken(data.access_token);
      setPlaylists(data.items || []);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error(`${source} fetch failed`, err);
    } finally {
      setLoading(false);
    }
  };

  fetchToken();
}, []);



  useEffect(() => {
    if (selectedPlaylistId) {
      console.log("Selected Playlist ID:", selectedPlaylistId);
    }
  }, [selectedPlaylistId]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🎵 PlaylistSync - {source === 'spotify' ? "Spotify" : "YouTube"}</h1>

      {!playlists.length && !loading && (
        <>
          <button onClick={handleLogin}>Login with Google (YouTube)</button>
          <button onClick={handleSpotifyLogin} style={{ marginLeft: "1rem" }}>Login with Spotify</button>
        </>
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
            onClick={() => setSelectedPlaylistId(pl.id)}
          >
            {source === 'spotify' ? (
              <>
                <img
                  src={pl.images?.[0]?.url || "https://via.placeholder.com/150"}
                  alt={pl.name}
                  style={{ width: '100%', borderRadius: '4px' }}
                />
                <p>{pl.name}</p>
              </>
            ) : (
              <>
                <img
                  src={pl.snippet?.thumbnails?.default?.url || "https://via.placeholder.com/150"}
                  alt={pl.snippet?.title}
                  style={{ width: '100%', borderRadius: '4px' }}
                />
                <p>{pl.snippet?.title}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {selectedPlaylistId && accessToken && source === 'youtube' && (
        <PlaylistVideos playlistId={selectedPlaylistId} accessToken={accessToken} />
      )}
    </div>
  );
}

export default App;
