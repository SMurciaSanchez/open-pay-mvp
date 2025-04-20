# OpenPay - Secure Financial Platform

OpenPay is a modern fintech platform designed to provide secure, reliable and user-friendly financial services. This monorepo contains both the frontend and backend components of the OpenPay MVP.

## 🚀 Project Structure

```
/
├── packages/
│   ├── api/                # Backend - Flask API
│   │   ├── src/            # Source code
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── users/      # User management module
│   │   │   ├── transactions/ # Transactions module
│   │   │   ├── payments/   # Payments module
│   │   │   └── app.py      # Main application
│   │   ├── tests/          # Unit and integration tests
│   │   ├── .env.example    # Environment variables template
│   │   └── requirements.txt # Python dependencies
│   │
│   ├── web/                # Frontend - Next.js
│   │   ├── src/            # Source code
│   │   │   ├── app/        # Next.js App Router
│   │   │   ├── components/ # Reusable UI components
│   │   │   └── lib/        # Utilities and helpers
│   │   ├── public/         # Static assets
│   │   └── package.json    # Node.js dependencies
│   │
│   └── shared/             # Shared code and types
│       └── types/          # TypeScript interfaces
│
└── README.md               # Project documentation
```

## 🛠️ Prerequisites

- Node.js 18.x or later
- Python 3.9 or later
- PostgreSQL 14.x (production) or SQLite (development)
- Redis (optional, for token management and caching)

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-org/openpay.git
cd openpay
```

### Backend Setup

1. Create a virtual environment and activate it:

```bash
cd packages/api
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Initialize the database:

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

5. Run the development server:

```bash
flask run
```

The API will be available at http://localhost:5000.

### Frontend Setup

1. Install dependencies:

```bash
cd packages/web
npm install
```

2. Run the development server:

```bash
npm run dev
```

The web app will be available at http://localhost:3000.

## 🧪 Testing

### Backend Tests

```bash
cd packages/api
pytest
```

For test coverage:

```bash
pytest --cov=src
```

### Frontend Tests

```bash
cd packages/web
npm test
```

## 🚢 Deployment

### Backend

1. Set up production environment variables in `.env.production`
2. Build and run with gunicorn:

```bash
gunicorn 'src.app:create_app()'
```

### Frontend

1. Build the application:

```bash
cd packages/web
npm run build
```

2. Start the production server:

```bash
npm start
```

Alternatively, deploy to Vercel:

```bash
vercel deploy
```

## 📝 Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## 🔒 Security

- All authentication uses JWT tokens with proper expiration and rotation
- Passwords are securely hashed using industry standards
- HTTPS is required for all communication
- Rate limiting is applied to sensitive endpoints
- See our full [Security Policy](SECURITY.md) for more details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@openpay.com or open an issue in the repository. 