import { useEffect, useState } from "react";
import axios from "axios";

const PlaylistVideos = ({ playlistId, accessToken }) => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          "https://www.googleapis.com/youtube/v3/playlistItems",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              part: "snippet",
              playlistId,
              maxResults: 25,
            },
          }
        );
        setVideos(res.data.items || []);
      } catch (err) {
        console.error("Failed to fetch videos", err);
      }
    };

    fetchVideos();
  }, [playlistId, accessToken]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>🎥 Videos in Playlist</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "0.5rem",
              width: "200px",
              background: "#fff",
            }}
          >
            <img
              src={video.snippet?.thumbnails?.medium?.url}
              alt={video.snippet?.title}
              style={{ width: "100%", borderRadius: "4px" }}
            />
            <p>{video.snippet?.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistVideos;
