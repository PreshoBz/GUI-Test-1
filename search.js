//Core Search Class to handle input using debounce and map cache, fetch results, and display them
class SearchComponent {
  constructor(inputEl, resultsEl, detailEls) {
    this.inputEl = inputEl;
    this.resultsEl = resultsEl;
    this.detailEls = detailEls;
    this.debounceTimer = null;
    this.cache = new Map();
    this.apiKey = "7da1f0bba32cd7bff0a0449e99ebecea";

    //Added Event Listeners
    this.inputEl.addEventListener("input", (e) => this.handleInput(e));
    this.inputEl.addEventListener("keydown", (e) => this.handleKeyboard(e));
  }

  //Includes debounce, map cache and fetch
  handleInput(e) {
    const query = e.target.value.trim();

    //Debounce timer to prevent excessive API calls
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (!query) {
        this.renderResults([]);
        return;
      }
      //Map cache to save results and prevent unnecessary API calls
      if (this.cache.has(query)) {
        this.renderResults(this.cache.get(query), query);
        return;
      }
      this.resultsEl.dataset.loading = "true";

      //Fetch results from TMDB API using my API key
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`,
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
}
