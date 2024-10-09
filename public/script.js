function searchProduct() {
    var searchInput = document.getElementById('searchInput').value.toLowerCase();

    // Send AJAX request to server to fetch search results
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Parse JSON response and display search results
                var searchResults = JSON.parse(xhr.responseText);
                displaySearchResults(searchResults);
            } else {
                console.error('Error fetching search results:', xhr.status);
            }
        }
    };
    xhr.open('GET', '/search?query=' + searchInput, true);
    xhr.send();
    
}

function displaySearchResults(results) {
    var searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = ''; // Clear previous search results

    if (results.length === 0) {
        searchResultsDiv.innerHTML = '<p>No results found</p>';
    } else {
        results.forEach(function(result) {
            // Create HTML elements to display search results
            var productDiv = document.createElement('div');
            productDiv.classList.add('product');

            var title = document.createElement('h3');
            title.textContent = result.title;

            var price = document.createElement('p');
            price.textContent = 'Price: ' + result.price;

            var image = document.createElement('img');
            image.src = result.image;

            productDiv.appendChild(title);
            productDiv.appendChild(price);
            productDiv.appendChild(image);

            searchResultsDiv.appendChild(productDiv);
        });
    }
}
