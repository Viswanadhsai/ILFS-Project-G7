SIT725 – Group 7 
🛰️ Trace Hub – Intelligent Lost & Found System

Project Overview:
Trace Hub is an intelligent, web‑based Lost & Found Management
System designed to streamline the process of reporting,
tracking, and matching lost and found items across public
spaces such as universities, transport hubs, and community
areas.

The system provides:

A user‑friendly frontend for reporting lost/found items
A secure authentication system
An automated matching engine
An admin dashboard for verification and management
A claims module for item recovery
A rating module for user feedback

This project was developed as part of SIT725 – Applied Software Engineering Unit.

👥 Team Members – Group 7
Name	                Role
Viswanadh Sai Mutte	    Team Lead, Backend Lead, Scrum Master
Sai Kiran Narla	        Frontend Lead, Full‑Stack Developer
Toufeeq Umar Shaik	    Backend Developer, Full‑Stack Developer
Ruthwik Reddy Bommana	Frontend Developer, Full‑Stack Developer

🚀 Key Features
🔐 User Authentication
Register & Login
JWT‑based authentication
Secure password handling

📍 Lost Item Reporting
Submit item details
Upload optional image

📦 Found Item Reporting
Submit found item details
View potential matches

🎯 Automated Matching System
Matches lost & found items based on:
Name
Category
Description similarity
Location
Date

📝 Claims Module
Users can claim matched items
Admin verifies claims

🛠️ Admin Dashboard
View all lost items
View all found items
Approve matches
Manage claims

🧱 Tech Stack
Frontend:
HTML
CSS
JavaScript

Backend:
Node.js
Express.js
MongoDB (Mongoose)
JWT Authentication

Project Structure:

ILFS-Project-G7/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── login.html
│   ├── register.html
│   ├── main.html
│   ├── report-lost.html
│   ├── report-found.html
│   ├── claims.html
│   ├── admin.html
│   └── user-dashboard.html
│
└── README.md

⚙️ How to Run the Project

1️⃣ Start the Backend : node server.js
Backend runs on: http://localhost:5000

2️⃣ Start the Frontend : npm start
Frontend runs on: http://localhost:3000

🔗 API Endpoints 

Auth:
POST /api/users/register
POST /api/users/login

Lost Items API 
POST /api/lost : Create a new lost item.
GET /api/lost  : Get all lost items.
GET /api/lost/filter :Filter lost items by location, date, category.
Query params:  location,date &category

Found Items API 
POST /api/found : Create a new found item.
GET /api/found  : Get all found items.

GET /api/found/filter :Filter found items by location, date, category.
Query params :  location, date & category 

Matching
GET /api/match

Claims
POST /api/claims
GET /api/claims

Ratings
POST /api/ratings

🧪 Testing & Validation

Backend console logs for all major actions
Form validation on frontend
Error handling on backend

🏆 Conclusion

Trace Hub delivers a complete, functional, and user‑friendly
Lost & Found solution with automated matching and claim
verification. The system demonstrates strong teamwork, clean
architecture, and full‑stack integration — meeting all Sprint 2
requirements at a High Distinction level.