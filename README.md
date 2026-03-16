In Test 1 for GUI Programming I demonstrate how movie search dashboard works using Javascript and CSS.  

I implemented the following:

1. Debounce to wait for a short delay after the user stops typing before running the search. This prevents multiple API requests from firing for every keystroke.

2. AbortController that cancels an earlier fetch request if the user continues typing and a new search starts. This prevents the partial search request from finishing later and replacing the results of the actual search.

3. Map caching to remember previous search results. If the user searches for the same term again, we get the results from the Map instantly instead of asking the API again.

4. DocumentFragment that allows for the  building of multiple elements first and then append them to the DOM all at once instead of adding each element individually.

5. XSS Security whereby instead of innerHTML, we build elements using the DOM API and textContent. This way, any user input is treated as plain text, and malicious code cannot run.