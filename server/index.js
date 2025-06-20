const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const querystring = require('querystring');


dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("REDIRECT:", process.env.GOOGLE_REDIRECT_URI);

const app = express();
app.use(cors());
app.use(express.json());

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
} = process.env;

app.get('/api/youtube/login', (req, res) => {
  const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
});

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("REDIRECT:", process.env.GOOGLE_REDIRECT_URI);

app.get('/api/youtube/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenRes.data;

    const playlistRes = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { part: 'snippet', mine: true, maxResults: 25 }
    });

    res.redirect(`http://localhost:5173?code=${code}&source=youtube`);


  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

app.post('/api/youtube/token', async (req, res) => {
  const code = req.body.code;
  try {
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenRes.data;
    console.log("Access Token:", access_token);

    const playlistRes = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { part: 'snippet', mine: true, maxResults: 25 }
    });

    return res.json({
      access_token,
      items: playlistRes.data.items
    });

  } catch (err) {
    console.error("OAuth error", err.response?.data || err);

    // Make sure this is the ONLY response if there's an error
    return res.status(500).json({ error: "OAuth failed" });
  }
});

app.get('/api/spotify/login', (req, res) => {
  const scope = 'playlist-read-private';
  const params = querystring.stringify({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/api/spotify/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data;

    const playlistsRes = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.redirect(`http://localhost:5173?code=${code}&source=spotify`);


  } catch (err) {
    console.error('Spotify OAuth error:', err.response?.data || err);
    res.status(500).json({ error: 'Spotify OAuth failed' });
  }
});

app.post('/api/spotify/token', async (req, res) => {
  const code = req.body.code;
  console.log("Token exchange code (backend):", req.body.code);


  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data;

    const playlistsRes = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    res.json({
      access_token,
      items: playlistsRes.data.items,
    });

  } catch (err) {
    console.error('Spotify token exchange failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Spotify OAuth failed' });
  }
});


app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
