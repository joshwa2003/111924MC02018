# URL Shortener Application

A full-stack web application that allows users to shorten URLs with custom validity periods and optional custom shortcodes. The application provides a statistics dashboard to view click data and expiry information for all shortened URLs.

## Features

- **URL Shortening**: Shorten multiple URLs at once with customizable validity periods (in minutes).
- **Custom Shortcodes**: Optionally provide custom shortcodes for shortened URLs.
- **Expiry Management**: URLs automatically expire after the specified time.
- **Statistics Dashboard**: View a table of all shortened URLs with click counts, original URLs, and expiry dates.
- **Click Tracking**: Track clicks on shortened URLs with detailed logs (timestamp, referrer, IP, user agent).
- **Local Storage**: Persist recent shortened URLs in the browser's local storage.
- **Responsive UI**: Built with Material-UI for a clean, responsive interface.

## Tech Stack

### Frontend
- **React 18**: JavaScript library for building user interfaces.
- **Material-UI**: React components implementing Google's Material Design.
- **Axios**: HTTP client for API requests (if needed in future).

### Backend
- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for Node.js.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing.

### Other
- **In-Memory Storage**: Uses a Map for storing URL data (suitable for development/demo purposes).

## Architecture

The application follows a client-server architecture:

- **Frontend**: React single-page application running on port 3000.
- **Backend**: Express server running on port 5001.
- **Data Flow**: Frontend communicates with backend via RESTful APIs.

### Flow Diagram

```
User Interaction Flow:

1. User opens the application (React App on port 3000)
   ├── Shortener Page
   │   ├── User adds URLs with validity and optional shortcode
   │   ├── "Shorten All" button clicked
   │   │   └── POST /shorturls (to backend on port 5001)
   │   │       ├── Validate URL
   │   │       ├── Generate/Validate shortcode
   │   │       ├── Store in memory with expiry
   │   │       └── Return shortLink and expiry
   │   └── Display recent shortened URLs (stored in localStorage)
   │
   └── Statistics Page
       ├── On page load, fetch stats
       │   └── GET /shorturls (from backend)
       │       └── Return list of all shortened URLs with stats
       └── Display in table: shortcode, original URL, clicks, expiry

2. External User clicks shortened URL (e.g., http://localhost:5001/abc123)
   └── GET /:shortcode (to backend)
       ├── Check if shortcode exists and not expired
       ├── Log click details (timestamp, referrer, IP, user agent)
       └── Redirect to original URL
```

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository** (if applicable) or ensure you have the project files.

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5001`.

2. **Start the frontend application** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

3. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

## Usage

### Shortening URLs
1. Navigate to the "Shortener" page.
2. Add one or more URLs (up to 5).
3. Set the validity period in minutes (default: 30).
4. Optionally provide a custom shortcode.
5. Click "Shorten All" to generate shortened URLs.
6. View the shortened links and their expiry dates.

### Viewing Statistics
1. Navigate to the "Statistics" page.
2. View the table of all shortened URLs, including:
   - Shortcode
   - Original URL
   - Number of clicks
   - Expiry date

### Accessing Shortened URLs
- Shortened URLs are in the format: `http://localhost:5001/{shortcode}`
- Clicking on them will redirect to the original URL and log the click.

## API Documentation

### POST /shorturls
Create a new shortened URL.

**Request Body**:
```json
{
  "url": "https://example.com",
  "validity": 30,
  "shortcode": "optional-custom-code"
}
```

**Response**:
```json
{
  "shortLink": "http://localhost:5001/abc123",
  "expiry": "2023-10-01T12:00:00.000Z"
}
```

### GET /shorturls
Retrieve a list of all shortened URLs with statistics.

**Response**:
```json
[
  {
    "shortcode": "abc123",
    "originalUrl": "https://example.com",
    "expiry": "2023-10-01T12:00:00.000Z",
    "clicks": 5
  }
]
```

### GET /shorturls/:shortcode
Retrieve detailed statistics for a specific shortcode.

**Response**:
```json
{
  "originalUrl": "https://example.com",
  "createdAt": "2023-09-30T12:00:00.000Z",
  "expiry": "2023-10-01T12:00:00.000Z",
  "clicks": 5,
  "clickDetails": [
    {
      "timestamp": "2023-09-30T12:30:00.000Z",
      "referrer": "",
      "ip": "::1",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

### GET /:shortcode
Redirect to the original URL and log the click.

**Response**: Redirects to the original URL or returns an error if not found/expired.

## Development Notes

- The backend uses in-memory storage, so data will be lost when the server restarts.
- URLs are validated using the `URL` constructor.
- Shortcodes are generated randomly (6 characters) or can be custom-provided.
- Click tracking includes basic information; in production, consider privacy implications.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test thoroughly.
5. Submit a pull request.

## License

This project is for educational/demo purposes. Use at your own discretion.
