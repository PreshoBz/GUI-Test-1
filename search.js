//Core Search Class variables declarations to handle input using debounce and map cache, fetch results, and display them
const apiKey = "7da1f0bba32cd7bff0a0449e99ebecea";
let debounceTimer = null;
const cache = new Map();

//Inialize AbortController to handle cancellation of previous fetch requests
let currentController = null;

//Added event listener to handle input and display results
const inputEl = document.querySelector(".search-input");
const resultsEl = document.querySelector(".search-results");

//Function that includes debounce, map cache and fetch
function handleInput(e) {
  const query = e.target.value.trim();

  //Debounce timer to prevent excessive API calls
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!query) {
      renderResults([]);
      return;
    }
    //Map cache to save results and prevent unnecessary API calls
    if (cache.has(query)) {
      renderResults(cache.get(query), query);
      return;
    }

    // Abort previous fetch
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const signal = currentController.signal;

    resultsEl.dataset.loading = "true";

    //Fetch results from TMDB API using my API key
    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`,
      { signal },
    )
      .then((res) => res.json())
      .then((data) => {
        const results = data.results || [];
        cache.set(query, results);
        renderResults(results, query);
      })
      .catch((err) => {
        if (err.name === "AbortError")
          console.log("Previous request cancelled");
        else console.error(err);
        renderResults([]);
      })
      .finally(() => (resultsEl.dataset.loading = "false"));
  }, 300);
}

//Function to render results in the DOM
function renderResults(results, query = "") {
  resultsEl.innerHTML = "";
  selectedIndex = -1;

  const frag = document.createDocumentFragment();

  results.forEach((movie) => {
    const div = document.createElement("div");
    div.textContent = movie.title;
    frag.appendChild(div);
  });
  resultsEl.appendChild(frag);
}

//Event listener to handle input and call the handleInput function
inputEl.addEventListener("input", handleInput);
