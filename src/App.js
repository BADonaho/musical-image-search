import { useState } from 'react';
import { useEffect } from 'react';
import './App.css';

const spotifyClientId = '48aaf583a08d4fc2bcbda0bca38221d4';
const spotifyRedirectUri = 'http://localhost:3000/';
const spotifyScopes = 'user-read-private user-read-email';
const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=token&redirect_uri=${encodeURIComponent(spotifyRedirectUri)}&scope=${encodeURIComponent(spotifyScopes)}`;
const pexelsApiKey = 'DUWicv6s2TgfvcEPtCxo06pDNbXe3lHn6yRJMrah3Nt1yKDT0myyipcV'

// An app that plays a song and displays related images based on the given search query.
function App() {
  return (
    <>
      <header className="Vertical">Musical Image Search</header>
      <Body />
    </>
  );
}

// Page where user can sarch for music and images.
function Body() {
  let searchQuery = '';
  let searchResults = [];

  // The OAuth token used by Spotify to authenticate the current user.
  const [accessToken, setAccessToken] = useState('');

  // Parse the access token from the URL hash.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      setAccessToken(new URLSearchParams(hash.substring(1)).get('access_token'));
      // Clear the hash after parsing.
      window.location.hash = '';
    }
  }, []);

  // Fetch music tracks based on the search query.
  async function searchTracks() {
    if (!searchQuery) return;
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    searchResults = data.tracks ? data.tracks.items : [];
    // Play the first audio track that has a preview URL.
    console.log("find here");
    const firstResult = searchResults.find((result) => result.preview_url && result.preview_url.length);
    if (firstResult) {
      const audioPlayer = document.getElementById("audio-player");
      audioPlayer.src = firstResult.preview_url;
      audioPlayer.play();
    } else {
      alert("No audio available for this search term.");
    }
  }

  // Fetch images based on the search query.
  async function searchPhotos() {
    if (!searchQuery) return;
    const perPage = 7;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${perPage}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: pexelsApiKey,
        },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Display images on the page
      displayPhotos(data.photos);
    } catch (error) {
      alert("No photos available for this search term.");
    }
  }

  // Display photos found in search on page.
  function displayPhotos(photos) {
    const container = document.getElementById('photo-container');
    // Clear previous results.
    container.innerHTML = '';
    photos.forEach((photo) => {
      const img = document.createElement('img');
      // Use medium resolution image.
      img.src = photo.src.medium;
      img.alt = photo.photographer;
      container.appendChild(img);
    });
  }

  function handleSearch() {
    searchTracks();
    searchPhotos();
  }

  return (
    !accessToken
      ? <a className="Vertical" href={spotifyAuthUrl}>Log in with Spotify</a>
      : <>
          <div className="Horizontal">
            <SearchInput searchQuery={searchQuery} onSearchQueryChange={(value) => searchQuery = value} onSearch={handleSearch} />
            <SearchButton onSearch={handleSearch} />
            <audio id="audio-player" controls style={{display: 'none'}}></audio>
          </div>
          <div id="photo-container"></div>
        </>
  );
}

// The search bar where a user types in a query.
function SearchInput({searchQuery, onSearchQueryChange, onSearch}) {
  // The search query currently typed in the search bar.
  const [query, setQuery] = useState(searchQuery);

  // User can also press enter/return to search instead of clicking the search button.
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch();
    }
  };

  return (
    <form>
      <input
        className="Horizontal"
        type="text"
        value={query}
        placeholder="Enter keyword here..."
        onChange={(e) => {
          setQuery(e.target.value);
          onSearchQueryChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
      />
    </form>
  );
}

// Button to press to search for music and images.
function SearchButton({onSearch}) {
  return (
    <button className="Horizontal" onClick={onSearch}>Search</button>
  );
}

export default App;