//Core Search Class variables declarations to handle input using debounce and map cache, fetch results, and display them
const apiKey = "7da1f0bba32cd7bff0a0449e99ebecea";
let debounceTimer = null;
const cache = new Map();
let selectedIndex = -1;

//Added event listener to handle input and display results
const inputEl = document.querySelector("#searchInput");
const resultsEl = document.querySelector("#results");

//Function that includes debounce, map cache and fetch
function handleInput(e) {
  const query = e.target.value.trim();

  //Debounce timer to prevent excessive API calls
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!query) {
      this.renderResults([]);
      return;
    }
    //Map cache to save results and prevent unnecessary API calls
    if (cache.has(query)) {
      renderResults(cache.get(query), query);
      return;
    }
    resultsEl.dataset.loading = "true";

    //Fetch results from TMDB API using my API key
    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
      { signal },
    )
      .then((res) => res.json())
      .then((data) => {
        const results = data.results || [];
        this.cache.set(query, results);
        this.renderResults(results, query);
      })
      .catch((err) => {
        if (err.name === "AbortError")
          console.log("Previous request cancelled");
        else console.error(err);
        this.renderResults([]);
      })
      .finally(() => (this.resultsEl.dataset.loading = "false"));
  }, 300);
}

//Function to render results in the DOM
function renderResults(results, query = "") {
  resultsEl.innerHTML = "";
  selectedIndex = -1;

  const frag = document.createDocumentFragment();

  results.forEach((movie) => {
    const div = document.createElement("div");
    frag.appendChild(div);
  });
  resultsEl.appendChild(frag);
}
