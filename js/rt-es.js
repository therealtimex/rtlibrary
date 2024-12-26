/**
 * Fetches documents from an Elasticsearch index using the search endpoint.
 *
 * @param {string} index - The name of the Elasticsearch index to search.
 * @param {object|null} query - The search query object (default is null).
 * @param {string|null} authToken - The Authorization header value (default is null).
 * @returns {Promise<object|null>} - Returns the search results as a JSON object or null if an error occurs.
 */
async function searchElasticsearch(index, query = null, authToken = null) {
    const url = `https://es.rta.vn/${index}/_search`; // Construct the URL for the search endpoint

    const headers = {
        'Content-Type': 'application/json' // Specify the content type
    };

    // Set the Authorization header if authToken is provided
    if (authToken) {
        headers['Authorization'] = authToken; // Use the provided authToken directly
    }

    // Build the request body; stringify only if query is not empty
    const body = query ? JSON.stringify({
        query
    }) : null;

    try {
        const response = await fetch(url, {
            method: 'POST', // Use POST method for search
            headers,
            body // Include the request body if it's not null
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); // Handle HTTP errors
        }

        const data = await response.json(); // Parse the JSON response
        return data; // Return the search results
    } catch (error) {
        console.error('Error fetching documents:', error); // Log any errors encountered
        return null; // Return null in case of an error
    }
}

/* Uncomment to test the search functionality
// Example usage:
const query = {
    match: {
        title: 'Elasticsearch'
    }
}; // Define your search query

// Authentication - Choose either Basic Auth or JWT based on your setup:
// Option 1 - Basic Auth:
// const authHeader = 'Basic ' + btoa('username:password');
// Option 2 - JWT:
const authHeader = 'Bearer your_jwt_token_here';

searchElasticsearch('your_index_name', query, authHeader)
    .then(data => console.log(data))
    .catch(error => console.error('Search failed:', error));
*/