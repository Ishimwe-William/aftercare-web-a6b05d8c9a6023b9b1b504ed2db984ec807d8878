/**
 * Utility function to extract a meaningful error message from an Axios error object.
 * This function is designed to work with Redux Toolkit's rejectWithValue.
 * * @param {object} error - The error object thrown by Axios.
 * @returns {string} The most relevant error message.
 */
export const handleApiError = (error) => {
    // 1. Check for specific response data from the server (e.g., Spring Boot error response)
    if (error.response && error.response.data) {
        // Prioritize a custom message field if available (e.g., 'message' or 'error')
        if (typeof error.response.data === 'string') {
            return error.response.data;
        }
        if (error.response.data.message) {
            return error.response.data.message;
        }
        if (error.response.data.error) {
            return error.response.data.error;
        }

        // Fallback to HTTP status text
        return `Error ${error.response.status}: ${error.response.statusText}`;
    }

    // 2. Check for request errors (e.g., timeout, network failure)
    if (error.request) {
        return 'Network error: Could not connect to the server.';
    }

    // 3. General error catch
    return error.message || 'An unknown API error occurred.';
};
