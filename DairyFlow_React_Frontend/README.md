# DairyFlow — Village Milk Collection & Payment System (Frontend)

## Requirements
- Node.js 18 or later
- npm

## Run the frontend
1. Extract this folder.
2. Open the folder in VS Code.
3. Open Terminal in VS Code.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite, usually `http://localhost:5173`.

## What is included
- Responsive dashboard
- Farmer directory and add-farmer form
- Milk delivery form with automatic rate and amount calculation
- Validation for litres, fat percentage and duplicate farmer/date/shift entries
- Rejected deliveries below 3% fat saved with amount ₹0
- Advance entry
- 10-day payment statement
- Farmer passbook
- Daily collection report
- Print-friendly passbook and reports

## Important demo note
This is a frontend prototype. It currently uses in-memory sample data and does not yet connect to Spring Boot or MongoDB. Refreshing the page resets changes. Authentication is represented by a role selector for interface preview, not secure login. Next, connect the forms and page data to Spring Boot REST endpoints, then add real role-based authentication and MongoDB persistence.
