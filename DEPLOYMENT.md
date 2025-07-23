# Beris Medical Equipment Store - Deployment Guide

## 🚀 Production Deployment

This guide will help you deploy the Beris application to production using Docker.

### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or use the included one)
- Redis (or use the included one)
- Domain name (optional, for SSL)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://beris:beris123@db:5432/beris
POSTGRES_DB=beris
POSTGRES_USER=beris
POSTGRES_PASSWORD=beris123

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-change-this
NEXTAUTH_URL=http://localhost:3000

# SMS Service (Kavenegar)
KAVENEGAR_API_KEY=your-kavenegar-api-key

# Redis
REDIS_URL=redis://redis:6379

# Payment Gateway (ZarinPal)
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id

# File Upload
UPLOAD_DIR=/app/uploads

# Environment
NODE_ENV=production
```

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd beris
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

5. **Seed the database (optional):**
   ```bash
   docker-compose exec app npm run seed
   ```

### Access the Application

- **Main Application:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Health Check:** http://localhost/health

### Production Considerations

#### 1. SSL/HTTPS Setup

For production, enable SSL by:

1. Obtain SSL certificates
2. Place them in the `ssl/` directory
3. Uncomment the HTTPS server block in `nginx.conf`
4. Update the `NEXTAUTH_URL` to use HTTPS

#### 2. Database Backup

Set up automated backups:

```bash
# Create backup script
docker-compose exec db pg_dump -U beris beris > backup.sql

# Restore from backup
docker-compose exec -T db psql -U beris beris < backup.sql
```

#### 3. Monitoring

Add monitoring with:

```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
```

#### 4. Logs

View logs:

```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f db

# Nginx logs
docker-compose logs -f nginx
```

### Scaling

#### Horizontal Scaling

To scale the application:

```bash
# Scale the app service
docker-compose up -d --scale app=3

# Update nginx.conf to use multiple upstream servers
upstream app {
    server app:3000;
    server app:3001;
    server app:3002;
}
```

#### Database Scaling

For high-traffic applications, consider:
- Using a managed PostgreSQL service (AWS RDS, Google Cloud SQL)
- Implementing read replicas
- Using connection pooling (PgBouncer)

### Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/HTTPS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs for suspicious activity

### Troubleshooting

#### Common Issues

1. **Database Connection Error:**
   ```bash
   docker-compose logs db
   # Check if database is running and accessible
   ```

2. **Build Failures:**
   ```bash
   docker-compose build --no-cache
   # Rebuild without cache
   ```

3. **Memory Issues:**
   ```bash
   # Add memory limits to docker-compose.yml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

4. **Port Conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Change ports in docker-compose.yml if needed
   ```

#### Performance Optimization

1. **Enable Gzip compression** (already configured in nginx.conf)
2. **Use CDN** for static assets
3. **Implement caching** strategies
4. **Optimize images** and use WebP format
5. **Monitor performance** with tools like Lighthouse

### Maintenance

#### Regular Tasks

1. **Update dependencies:**
   ```bash
   docker-compose exec app npm update
   docker-compose build --no-cache
   ```

2. **Database maintenance:**
   ```bash
   docker-compose exec db vacuumdb -U beris beris
   ```

3. **Log rotation:**
   ```bash
   # Configure logrotate for nginx logs
   ```

4. **Security updates:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

### Support

For issues and questions:
- Check the logs: `docker-compose logs`
- Review the application health: `curl http://localhost/health`
- Monitor resource usage: `docker stats`

### Backup and Recovery

#### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker-compose exec -T db pg_dump -U beris beris > $BACKUP_DIR/db_$DATE.sql

# Uploads backup
docker-compose exec app tar czf - /app/uploads > $BACKUP_DIR/uploads_$DATE.tar.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

This deployment setup provides a production-ready environment with proper security, monitoring, and maintenance procedures. 