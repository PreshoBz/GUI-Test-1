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

    //Abort previous fetch
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
    //Load movie details on click
    div.addEventListener("click", () => loadMovie(movie.id));
    frag.appendChild(div);
  });
  resultsEl.appendChild(frag);
}

//Event listener to handle input and call the handleInput function
inputEl.addEventListener("input", handleInput);

//Detail elements to display movie details when a result is clicked
const detailPanel = document.querySelector("#detailPanel");
const detailTitle = document.querySelector("#detailTitle");
const detailOverview = document.querySelector("#detailOverview");
const detailCast = document.querySelector("#detailCast");
const detailVideos = document.querySelector("#detailVideos");

//Function to load movie details, cast and videos when a result is clicked
function loadMovie(id) {
  detailPanel.classList.remove("hidden");
  
  //Fetch movie details, cast and videos using promise.allSettled to handle multiple fetch requests and display results 
  Promise.allSettled([
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`).then(
      (r) => r.json(),
    ),
    fetch(
      `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`,
    ).then((r) => r.json()),
    fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}`,
    ).then((r) => r.json()),
  ]).then(([details, credits, videos]) => {
    
    // Movie details
     if (details.status === "fulfilled") {
      detailTitle.textContent = details.value.title;
      detailOverview.textContent = details.value.overview || "No overview available.";
    } else {
      detailTitle.textContent = "Failed to load movie details";
      detailOverview.textContent = "";
      console.warn("Details failed to load:", details.reason);
    }


    // Cast details
detailCast.innerHTML = ""; // Clear previous content
if (credits.status === "fulfilled" && credits.value && Array.isArray(credits.value.cast)) {
  credits.value.cast.slice(0, 5).forEach(actor => {
    const li = document.createElement("li");
    li.textContent = actor.name;
    detailCast.appendChild(li);
  });
} else {
  // Placeholder for failed fetch
  const li = document.createElement("li");
  li.textContent = "Failed to load cast";
  detailCast.appendChild(li);
  console.warn("Credits failed to load or cast data missing:", credits.reason);
}

    // Videos details
   detailVideos.innerHTML = ""; // Clear previous content
    if (videos.status === "fulfilled") {
      videos.value.results.slice(0, 2).forEach(video => {
        const a = document.createElement("a");
        a.href = `https://youtube.com/watch?v=${video.key}`;
        a.textContent = "Watch Trailer";
        a.target = "_blank";
        detailVideos.appendChild(a);
        // Add a space after each link
        detailVideos.appendChild(document.createTextNode(" "));
      });
    } else {
      const span = document.createElement("span");
      span.textContent = "Failed to load videos";
      detailVideos.appendChild(span);
      console.warn("Videos failed to load:", videos.reason);
    }
  });
}