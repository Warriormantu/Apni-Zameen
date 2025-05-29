# Apni Zameen Deployment Guide

## Frontend Deployment (Netlify)

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Set environment variables:
   ```
   VITE_API_URL=https://your-api-domain.com
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_SITE_URL=https://your-frontend-domain.com
   ```

## Backend Deployment (cPanel)

1. Create a new database in cPanel
2. Import the database schema from `apni-zameen-api/config/schema.sql`
3. Upload backend files to public_html or a subdirectory
4. Configure environment variables in `.env`:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_NAME=apni_zameen_db
   DB_USER=your_username
   DB_PASS=your_password

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=86400

   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880

   # Email Configuration (if needed)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_email_password
   ```
5. Set up SSL certificate
6. Configure PHP version (7.4 or higher)
7. Set proper file permissions:
   - Directories: 755
   - Files: 644
   - Upload directory: 777

## Database Configuration

1. Create a new MySQL database named `apni_zameen_db`
2. Import schema:
   ```bash
   mysql -u username -p apni_zameen_db < apni-zameen-api/config/schema.sql
   ```
3. Update database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_NAME=apni_zameen_db
   DB_USER=your_username
   DB_PASS=your_password
   ```
4. Set up database backup schedule

## Security Checklist

- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up proper file permissions
- [ ] Implement rate limiting
- [ ] Enable error logging
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable security headers

## Performance Optimization

- [ ] Enable GZIP compression
- [ ] Configure browser caching
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Enable CDN
- [ ] Configure database indexes
- [ ] Set up monitoring

## Testing Checklist

- [ ] Test all user flows
- [ ] Verify form validations
- [ ] Check error handling
- [ ] Test file uploads
- [ ] Verify email functionality
- [ ] Test payment integration
- [ ] Check mobile responsiveness
- [ ] Verify cross-browser compatibility

## Post-Deployment

1. Monitor error logs
2. Set up uptime monitoring
3. Configure backup schedule
4. Set up SSL certificate renewal
5. Configure domain DNS settings
6. Test all critical functionality
7. Monitor performance metrics

## Troubleshooting

### Common Issues

1. CORS errors
   - Check CORS configuration in backend
   - Verify API URL in frontend

2. Database connection issues
   - Verify database credentials
   - Check database server status
   - Verify database permissions

3. File upload issues
   - Check directory permissions
   - Verify file size limits
   - Check PHP configuration

4. SSL/HTTPS issues
   - Verify SSL certificate
   - Check mixed content warnings
   - Verify redirect rules

### Support

For deployment support, contact:
- Email: support@apnizameen.com
- Documentation: https://docs.apnizameen.com (Coming Soon)
- GitHub Issues: https://github.com/your-org/apni-zameen/issues

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/apni-zameen.git
   cd apni-zameen
   ```

2. Frontend setup:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Backend setup:
   ```bash
   cd apni-zameen-api
   composer install
   ```

4. Start development server:
   ```bash
   # Option 1: PHP built-in server
   php -S localhost:8000

   # Option 2: XAMPP
   # Copy files to htdocs directory
   # Access via http://localhost/apni-zameen-api

   # Option 3: Docker (if configured)
   docker-compose up
   ```

5. Required PHP packages (composer.json):
   ```json
   {
       "require": {
           "php": ">=7.4",
           "firebase/php-jwt": "^6.0",
           "vlucas/phpdotenv": "^5.3",
           "intervention/image": "^2.7"
       }
   }
   ```

6. Create required directories:
   ```bash
   mkdir -p uploads/properties
   chmod -R 777 uploads
   ```

## File Upload Configuration

1. Create required upload directories:
   ```bash
   mkdir -p apni-zameen-api/uploads/properties
   chmod -R 777 apni-zameen-api/uploads
   ```

2. Directory structure:
   ```
   apni-zameen-api/
   ├── uploads/
   │   └── properties/
   │       └── {property_id}/
   │           └── {image_files}
   ```

3. Set proper permissions:
   - Upload directory: 777 (rwxrwxrwx)
   - Parent directories: 755 (rwxr-xr-x)
   - Files: 644 (rw-r--r--)

4. Configure PHP settings in php.ini:
   ```ini
   upload_max_filesize = 5M
   post_max_size = 8M
   max_file_uploads = 20
   ``` 