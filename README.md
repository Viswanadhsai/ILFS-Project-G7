# ILFS - Intelligent Lost and Found System

TRACE HUB is a frontend prototype for an Intelligent Lost and Found System. It allows users to register, log in, report lost items, report found items, view item listings, and see potential matches between lost and found reports.

## Features

- User registration and login
- Lost item report form
- Found item report form
- Frontend form validation
- Main dashboard for lost and found items
- Search across item reports
- Potential item matching based on category, keywords, location, and date
- Admin dashboard for managing reports
- Admin status updates for reports
- LocalStorage fallback for frontend demo data

## Technologies Used

- HTML
- CSS
- JavaScript
- Materialize CSS
- Browser LocalStorage

## Project Structure

```txt
ILFS-Project-G7/
  admin.html
  login.html
  main.html
  register.html
  report-found.html
  report-lost.html
  README.md
  css/
    style.css
  js/
    admin.js
    auth.js
    dashboard.js
    foundItems.js
    lostItems.js
```

## Setup Instructions

1. Download or clone the project.
2. Open the `ILFS-Project-G7` folder.
3. Open `login.html` in a browser.
4. Register a demo account.
5. Log in to access the main dashboard.
6. Use `Report Lost` or `Report Found` to create item reports.
7. View potential matches on the main dashboard.
8. Open `admin.html` to review reports and manage item statuses.

## Testing Evidence

Manual UI workflow test cases are documented in:

- `docs/ui-test-cases.md`

## Frontend Demo Notes

This project currently works as a frontend demo. When the backend is not available, submitted users and item reports are stored in browser LocalStorage.

To clear demo data, open browser developer tools and clear LocalStorage for this site.

## Backend Connection

The frontend currently expects a backend API at:

```txt
http://localhost:5000/api/v1
```

The existing JavaScript files already include fetch calls for:

- user login
- user registration
- lost item submission
- found item submission

The backend should provide matching endpoints and accept the same field names used by the frontend forms.

## Main Pages

- `login.html` - user login page
- `register.html` - user registration page
- `main.html` - main lost and found dashboard
- `report-lost.html` - lost item report form
- `report-found.html` - found item report form
- `admin.html` - admin dashboard

## Matching Logic

Potential matches are calculated in:

- `js/dashboard.js` for the main dashboard
- `js/admin.js` for the admin dashboard

The matching score compares:

- item category
- shared keywords
- similar location
- lost and found date range

## Admin Features

The admin dashboard allows staff to:

- view all lost and found reports
- search reports
- filter by type and status
- update item status
- view potential matches
- mark items as matched
- delete local demo reports
