import { useState } from 'react';
import './App.css';

// An app that plays a song and displays related images based on the given search query.
function App() {
  const [query, setQuery] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        Musical Image Search
        <SearchBar
          query={query}
          onQueryChange={setQuery} />
        </header>
    </div>
  );
}

// The search bar where a user types in a query.
function SearchBar({
  query,
  onQueryChange,
}) {
  return (
    <form>
      <input className="App-header"
        type="text"
        value={query} placeholder="Search..."
        onChange={(e) => onQueryChange(e.target.value)} />
    </form>
  );
}

export default App;