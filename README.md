# 💰 Expense Tracker (Full-Stack Web App)

🌍 **Live Demo:** [Click here to view the live project](https://musical-frangipane-2b32ae.netlify.app/)

---

## 🔒 Security Features

To ensure the safety of user data and prevent unauthorized access, the backend implements industry-standard security protocols:

* **Password Hashing (`scrypt`):** User passwords are never stored in plain text. The system utilizes the `scrypt` key derivation function via `Werkzeug` to securely hash and salt passwords before storing them in the SQLite database. This effectively protects user credentials against brute-force and pre-computation (rainbow table) attacks.
* **Authentication via JWT (JSON Web Tokens):** Secure user sessions are handled using digitally signed stateless JWTs, ensuring tamper-proof communication between the frontend and backend.
* **CORS Enabled:** Cross-Origin Resource Sharing is strictly configured to allow secure API requests only from authorized origins (like the Netlify production frontend).


## 💡 About the Project (What is this app for?)
**Expense Tracker** is a personal finance management tool designed to help individuals take control of their daily economy. Often, people lose track of where their money goes. This application solves that problem by allowing users to:
* Create a personal, secure account.
* Log their daily incomes (salary, freelance work, etc.) and expenses (groceries, bills, entertainment).
* Instantly see their overall available balance. 

Whether you are trying to save money, stick to a budget, or just understand your spending habits, this app provides a simple and effective way to monitor your financial health.

## ✨ Features
* **User Authentication:** Secure signup and login functionality using JWT (JSON Web Tokens).
* **Expense Management:** Add, view, and delete income and expense entries seamlessly.
* **Real-time Balance:** Automatically calculates and displays the total balance based on the transaction history.
* **Modern UI/UX:** Clean, responsive design with interactive pop-up notifications using `react-toastify`.
* **Data Security:** Passwords are fully hashed and encrypted using `werkzeug.security`.

## 🛠️ Tech Stack
* **Frontend:** React.js, Axios, React-Toastify
* **Backend:** Python, Flask, Flask-CORS, PyJWT
* **Database:** SQLite
* **Deployment:** Netlify (Frontend) / PythonAnywhere (Backend)

## 📁 Folder Structure

```text
expense-tracker/
│
├── backend/                 # Python Flask Server
│   ├── app.py               # Main API application logic
│   ├── db_setup.py          # Database initialization & table creation
│   ├── requirements.txt     # Python dependencies
│   └── .gitignore           # Ignores database files & pycache
│
├── frontend/                # React User Interface
│   ├── public/              # Static files (Favicon, manifest)
│   ├── src/
│   │   ├── App.js           # Main React component & UI logic
│   │   ├── App.css          # Styling
│   │   └── index.js         # React entry point
│   ├── package.json         # Node.js dependencies
│   └── .gitignore           # Ignores node_modules & build folders
│
├── .gitignore               # Main repository ignore rules
└── README.md                # Project documentation
🚀 Installation & Local Setup
If you want to run this project on your local machine, follow these steps:

1. Clone the repository
Bash
git clone (https://github.com/bayramovh062-ui/Expense-Tracker)
cd expense-tracker
2. Backend Setup
Bash
cd backend
pip install -r requirements.txt
python db_setup.py         # Initialize the database
python app.py              # Server will start on http://localhost:5000
3. Frontend Setup
Bash
cd ../frontend
npm install
npm start                  # App will launch on http://localhost:3000
🤝 Let's Connect!
If you'd like to discuss this project or explore professional opportunities, feel free to connect with me on [LinkedIn!]{https://www.linkedin.com/in/huseyn-bayramov-89a661336}
