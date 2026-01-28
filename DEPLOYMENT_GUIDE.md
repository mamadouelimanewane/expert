# 🚀 Guide de Déploiement - Cabinet 360

**Version**: 2.0.0  
**Date**: 28 Janvier 2026  
**Environnement**: Production

---

## 📋 Prérequis

### Serveur
- **Node.js**: v18.x ou supérieur
- **PostgreSQL**: v14.x ou supérieur
- **RAM**: Minimum 2GB (4GB recommandé)
- **Stockage**: Minimum 10GB
- **OS**: Ubuntu 20.04+ / Debian 11+ / Windows Server 2019+

### Services Externes
- **Base de données**: PostgreSQL (local ou cloud - Supabase, Neon, etc.)
- **Stockage fichiers**: Local ou S3-compatible
- **Email**: SMTP configuré (Gmail, SendGrid, etc.)

---

## 🔧 Étape 1: Configuration de la Base de Données

### Option A: PostgreSQL Local

```bash
# Installer PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE cabinet_ohada;
CREATE USER cabinet_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE cabinet_ohada TO cabinet_user;
\q
```

### Option B: PostgreSQL Cloud (Supabase)

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Copier la connection string PostgreSQL
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Option C: Neon (Serverless PostgreSQL)

1. Créer un compte sur [Neon](https://neon.tech)
2. Créer un nouveau projet
3. Copier la connection string
4. Avantages: Auto-scaling, gratuit jusqu'à 10GB

---

## 📦 Étape 2: Installation de l'Application

```bash
# Cloner le repository
git clone https://github.com/mamadouelimanewane/expert.git
cd expert/cabinet-expert-ohada

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

### Configuration .env

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/cabinet_ohada"

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET="votre-secret-jwt-tres-securise-32-caracteres-minimum"

# Application
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"
NODE_ENV="production"

# Upload
MAX_FILE_SIZE="10485760"
UPLOAD_DIR="./uploads"

# Email (optionnel)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe-app"
SMTP_FROM="noreply@cabinet360.com"

# OCR (optionnel)
GOOGLE_VISION_API_KEY=""

# Mobile Money (optionnel)
WAVE_API_KEY=""
ORANGE_MONEY_API_KEY=""
MTN_MOMO_API_KEY=""
```

---

## 🗄️ Étape 3: Initialisation de la Base de Données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# (Optionnel) Seed avec des données de test
npx prisma db seed
```

**Note**: Le seed créera 3 utilisateurs de test :
- Admin: `admin@cabinet360.com` / `Admin@2026!`
- Expert: `expert@cabinet360.com` / `Expert@2026!`
- Collaborateur: `collaborator@cabinet360.com` / `Collab@2026!`

---

## 🏗️ Étape 4: Build de Production

```bash
# Build l'application
npm run build

# Tester le build localement
npm start
```

L'application sera accessible sur `http://localhost:3000`

---

## 🌐 Étape 5: Déploiement

### Option A: Vercel (Recommandé - Le plus simple)

1. **Installer Vercel CLI**
```bash
npm install -g vercel
```

2. **Login et déployer**
```bash
vercel login
vercel --prod
```

3. **Configurer les variables d'environnement**
- Aller sur le dashboard Vercel
- Settings → Environment Variables
- Ajouter toutes les variables du `.env`

4. **Configurer le domaine**
- Settings → Domains
- Ajouter votre domaine personnalisé

**Avantages Vercel**:
- ✅ Déploiement en 1 commande
- ✅ HTTPS automatique
- ✅ CDN global
- ✅ Preview deployments
- ✅ Gratuit jusqu'à 100GB bandwidth

### Option B: VPS (Ubuntu/Debian)

1. **Installer Node.js et PM2**
```bash
# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2
sudo npm install -g pm2
```

2. **Configurer l'application**
```bash
# Créer le dossier de l'app
sudo mkdir -p /var/www/cabinet360
sudo chown -R $USER:$USER /var/www/cabinet360

# Copier les fichiers
cd /var/www/cabinet360
# ... (git clone ou upload)

# Installer et build
npm install
npm run build
```

3. **Démarrer avec PM2**
```bash
# Créer le fichier ecosystem
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cabinet360',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cabinet360',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Démarrer l'app
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Configurer Nginx**
```bash
# Installer Nginx
sudo apt install nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/cabinet360
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/cabinet360 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Configurer SSL avec Let's Encrypt**
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Auto-renouvellement (déjà configuré par défaut)
sudo certbot renew --dry-run
```

### Option C: Docker

1. **Créer le Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Créer docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=cabinet_ohada
      - POSTGRES_USER=cabinet_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

3. **Déployer**
```bash
docker-compose up -d
```

---

## 🔒 Étape 6: Sécurité

### Checklist Sécurité

- [ ] **Variables d'environnement**: Jamais commiter le `.env`
- [ ] **JWT Secret**: Utiliser un secret fort (32+ caractères)
- [ ] **HTTPS**: Obligatoire en production
- [ ] **Rate Limiting**: Configurer pour éviter les abus
- [ ] **CORS**: Configurer les origines autorisées
- [ ] **Headers de sécurité**: CSP, X-Frame-Options, etc.
- [ ] **Backup DB**: Automatiser les sauvegardes quotidiennes
- [ ] **Monitoring**: Configurer les alertes

### Configuration des Headers de Sécurité

Ajouter dans `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## 📊 Étape 7: Monitoring & Maintenance

### Logs

```bash
# Voir les logs PM2
pm2 logs cabinet360

# Voir les logs Vercel
vercel logs

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitoring

**Services recommandés**:
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics, Google Analytics
- **Errors**: Sentry
- **Database**: Supabase Dashboard, pgAdmin

### Backup Automatique

```bash
# Script de backup PostgreSQL
cat > /usr/local/bin/backup-cabinet360.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/cabinet360"
mkdir -p $BACKUP_DIR

pg_dump -U cabinet_user cabinet_ohada | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-cabinet360.sh

# Ajouter au cron (tous les jours à 2h du matin)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-cabinet360.sh") | crontab -
```

---

## 🔄 Étape 8: Mises à Jour

### Déploiement d'une nouvelle version

```bash
# Pull les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install

# Mettre à jour la base de données
npx prisma db push

# Rebuild
npm run build

# Redémarrer (PM2)
pm2 restart cabinet360

# Ou redéployer (Vercel)
vercel --prod
```

---

## 🆘 Dépannage

### Problème: Application ne démarre pas

```bash
# Vérifier les logs
pm2 logs cabinet360 --lines 100

# Vérifier la connexion DB
npx prisma db pull

# Vérifier les variables d'environnement
cat .env
```

### Problème: Erreur de base de données

```bash
# Réinitialiser Prisma
npx prisma generate
npx prisma db push --force-reset

# Reseed
npx prisma db seed
```

### Problème: Upload de fichiers ne fonctionne pas

```bash
# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/cabinet360/uploads
sudo chmod -R 755 /var/www/cabinet360/uploads
```

---

## 📞 Support

**Email**: support@cabinet360.com  
**Documentation**: https://docs.cabinet360.com  
**GitHub**: https://github.com/mamadouelimanewane/expert

---

## ✅ Checklist Finale de Déploiement

- [ ] Base de données créée et accessible
- [ ] Variables d'environnement configurées
- [ ] Prisma migrations appliquées
- [ ] Build de production réussi
- [ ] Application accessible via HTTPS
- [ ] Certificat SSL valide
- [ ] Backup automatique configuré
- [ ] Monitoring en place
- [ ] Tests UAT passés
- [ ] Documentation à jour
- [ ] Équipe formée

---

**🎉 Félicitations ! Cabinet 360 est maintenant en production !**

*Dernière mise à jour: 28 Janvier 2026*
