# Sale Board - Fullstack Marketplace App

A dockerized fullstack marketplace application built with **React**, **Node.js (Express)**, and **PostgreSQL**. The app allows users to browse, search, and manage product offers with integrated image uploading. <br/>
Hosted version is availabe at link: http://138.2.139.84:3005/
## Key Features

- **User Authentication:** Secure login and registration using JWT.
- **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for offers.
- **Advanced Filtering:** Search by name, filter by category, and sort by price/date.
- **Image Handling:** Support for product photos using Multer (Backend) and FormData (Frontend).
- **Responsive UI:** Clean, modern interface styled with raw CSS.
- **Dockerized:** Entire stack managed with Docker Compose for easy environment setup.

## Tech Stack

- **Frontend:** React.js, React Router, Axios, CSS3.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL 15.
- **DevOps:** Docker, Docker Compose, Hosted on Oracle Cloud VPS.

## Screenshots

### Dashboard & Browsing
![Main View](https://github.com/user-attachments/assets/d24d1b3f-9a3e-40ff-81b7-b71387c7fa7f) 
*Users can browse all offers with real-time filtering and sorting.*

### Product Management
![Edit Mode](https://github.com/user-attachments/assets/384fa3cb-7b93-4676-8d74-952c224f7462)
*Authenticated users can edit their products, change prices, and update photos via a clean modal interface.*

### Search & Categories
![Search View](https://github.com/user-attachments/assets/42227528-cbb7-4191-8398-cb32e9218aff)
*Integration with PostgreSQL allows for efficient searching and category-based filtering.*

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Git

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/sale-board.git](https://github.com/your-username/sale-board.git)
   cd sale-board
   ```
2. **Configure Environment Variables: Create a .env file in the root directory and add:**
   ```bash
   DB_USER=your_user
   DB_PASS=your_password
   DB_NAME=sale_board
   JWT_SECRET=your_secret_key
   ```
3. **Launch with docker**
   ```bash
   docker-compose up --build
   ```
   The app will be available at http://localhost:3005.
