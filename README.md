# Dr_Shopper 🛒

A complete web application for shopping management with Flask backend and React frontend.

## 🚀 Features

- **Backend**: REST API with Flask, SQLAlchemy and JWT
- **Frontend**: Modern interface with React and Vite
- **Authentication**: Secure authentication system with JWT
- **Database**: ORM with SQLAlchemy and migrations
- **CORS**: Configured for communication between frontend and backend

## 📁 Project Structure

```
Dr_Shopper/
├── Backend/                 # Flask API
│   ├── app/
│   │   ├── __init__.py     # App configuration
│   │   ├── auth.py         # Authentication
│   │   ├── config.py       # Configuration
│   │   ├── models.py       # Database models
│   │   └── routes.py       # API routes
│   ├── migrations/         # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Execution script
└── frontend/              # React application
    ├── src/
    │   ├── App.jsx        # Main component
    │   └── main.jsx       # Entry point
    ├── package.json       # Node.js dependencies
    └── vite.config.js     # Vite configuration
```

## 🛠️ Technologies Used

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: Database ORM
- **Flask-JWT-Extended**: JWT authentication
- **Flask-Migrate**: Database migrations
- **Flask-CORS**: CORS support

### Frontend
- **React**: User interface library
- **Vite**: Build tool
- **ESLint**: JavaScript linter

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Configure environment variables (create a `.env` file):
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///app.db
```

6. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

7. Run the server:
```bash
python run.py
```

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## 🌐 Usage

- **Backend**: Available at `http://localhost:5000`
- **Frontend**: Available at `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Users
- `GET /users` - Get users list
- `GET /users/<id>` - Get specific user
- `PUT /users/<id>` - Update user
- `DELETE /users/<id>` - Delete user

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name** - [your-email@example.com](mailto:your-email@example.com)

## 🙏 Acknowledgments

- Flask for the excellent framework
- React for the user interface library
- The developer community for support 