#!/bin/sh
set -e

# Prisma Migrate creates a temporary shadow database during development.
mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
GRANT ALL PRIVILEGES ON \`prisma\_migrate\_shadow\_db\_%\`.* TO '$MYSQL_USER'@'%';
SQL
