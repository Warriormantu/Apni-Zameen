# Apni Zameen - Real Estate Platform

A modern real estate platform built with React and PHP, allowing users to buy, sell, and rent properties.

## Features

- User Authentication (Buyers, Sellers, Admin)
- Property Listings with Multiple Images
- Advanced Property Search
- Property Inquiries
- Favorites System
- Admin Dashboard
- Responsive Design

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Vite
- Axios
- React Router

### Backend
- PHP 7.4+
- MySQL
- JWT Authentication
- RESTful API

## Getting Started

### Prerequisites
- Node.js 14+
- PHP 7.4+
- MySQL 5.7+
- Composer

### Installation

1. Clone the repository
```bash
git clone https://github.com/Warriormantu/Apni-Zameen.git
cd Apni-Zameen
```

2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

3. Backend Setup
```bash
cd apni-zameen-api
composer install
```

4. Database Setup
```bash
# Import the database schema
mysql -u username -p apni_zameen_db < apni-zameen-api/config/schema.sql
```

5. Environment Configuration
- Copy `.env.example` to `.env` in both frontend and backend
- Update the environment variables

## Development

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:8000

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Mantu Gupta - [@Warriormantu](https://github.com/Warriormantu)

Project Link: [https://github.com/Warriormantu/Apni-Zameen](https://github.com/Warriormantu/Apni-Zameen) 