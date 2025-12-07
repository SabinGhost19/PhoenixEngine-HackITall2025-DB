FROM php:8.1-apache

# Install PostgreSQL extension
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Enable mod_rewrite for Apache
RUN a2enmod rewrite

# Suppress ServerName warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Configure Apache routing directly (no .htaccess needed)
RUN echo '<Directory /var/www/html/>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride None\n\
    Require all granted\n\
    \n\
    RewriteEngine On\n\
    RewriteRule ^users$ users.php [L]\n\
</Directory>' >> /etc/apache2/apache2.conf

COPY . /var/www/html/

# Configure Apache to route everything to index.php if needed, 
# but for this simple API, direct access to index.php or routing via .htaccess is fine.
# We'll assume the request goes to /index.php or we configure a simple router.
# For simplicity, we'll just use the default Apache config which serves index.php.

EXPOSE 8081
# Change Apache port to 8081
RUN sed -i 's/80/8081/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf
