# Despliegue en la nube (DigitalOcean)

Guía paso a paso para pasar de "corre en mi Windows" a "alojado y
funcionando en la nube", usando lo que ya tienes en `docker-compose.yml`
sin cambios de arquitectura.

## 1. Crear la cuenta y el Droplet

1. Crea cuenta en https://www.digitalocean.com (piden tarjeta, pero no
   hay capa gratuita permanente - sí ofrecen crédito promocional a
   cuentas nuevas que suele cubrir de sobra los días de la materia).
2. **Create → Droplets**:
   - Imagen: **Ubuntu 22.04 (LTS) x64**.
   - Plan: mínimo **2 GB RAM / 1 vCPU** (Basic, ~$12 USD/mes). El stack
     corre 8 contenedores (Postgres, 2 API públicas, API privada,
     admin-panel, nginx, Prometheus, Grafana, node-exporter); con 1 GB
     va muy justo para hacer un `docker compose build`. Si notas swap
     alto durante el build, sube a 4 GB solo mientras construyes y
     luego reduce.
   - Región: la más cercana a donde presentarás (para latencia en vivo).
   - Auth: SSH key (recomendado) o password.
3. Anota la **IP pública** que te asigna, ej. `164.92.123.45`.

## 2. Firewall de DigitalOcean (a nivel de red, antes que iptables)

En **Networking → Firewalls**, crea uno y ábrelo a este droplet con:
- Inbound: SSH (22), HTTP (80), HTTPS (443), Custom TCP 3002 (Grafana).
- Outbound: todo (default).

Esto es aparte del `iptables-rules.sh` del repo (ese corre *dentro* del
droplet; el firewall de DigitalOcean filtra *antes* de llegar a él -
tener ambos es justo el tipo de defensa en profundidad que pide la
rúbrica).

## 3. Conectarte e instalar Docker

```bash
ssh root@164.92.123.45

curl -fsSL https://get.docker.com | sh
apt-get install -y docker-compose-plugin git
```

## 4. Clonar el repo y configurar secretos reales

```bash
git clone https://github.com/sachaguz/SIFUT-PI.git
cd SIFUT-PI
git checkout claude/backend-implementation-plan-gea483   # o main, según lo que despliegues

cp .env.example .env
```

Edita `.env` y reemplaza **todos** los valores de ejemplo (no dejes los
del repo, son públicos):

```bash
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
GRAFANA_PASSWORD=<algo que tú elijas>
```

(Puedes correr esos `openssl rand -hex 32` sueltos y pegar el resultado
en el `.env`.)

## 5. Certificado autofirmado, firewall del host y levantar el stack

`infrastructure/ssl/*.crt` y `*.key` están en `.gitignore` (son
generados, no viven en el repo) - genera uno antes de levantar nginx o
se va a quedar reiniciando en loop por no encontrar el certificado:

```bash
bash infrastructure/ssl/generate-certs.sh
sudo bash infrastructure/firewall/iptables-rules.sh
docker compose up -d --build
docker compose ps   # todo debe quedar "healthy" / "Up" (nginx incluido, no "Restarting")
```

Si Docker no resuelve nombres de dominio durante el build (`npm error`
con `EAI_AGAIN`), es el problema común de `systemd-resolved` en Ubuntu
22.04: crea `/etc/docker/daemon.json` con `{"dns": ["8.8.8.8", "1.1.1.1"]}`
y corre `systemctl restart docker` antes de reintentar.

## 6. Monitoreo del firewall (opcional pero ya viene listo)

```bash
mkdir -p /var/lib/node_exporter/textfile_collector
(crontab -l 2>/dev/null; echo "* * * * * root $(pwd)/infrastructure/firewall/export-metrics.sh") | sudo crontab -
```

Prometheus ya tiene el scrape job `firewall` apuntando a `node-exporter:9100`,
y Grafana ya trae el dashboard **SIFUT Firewall Monitoring** provisto en
`infrastructure/grafana/dashboards/sifut-firewall.json`.

## 7. Certificado SSL real (no autofirmado)

Sigue `infrastructure/ssl/README.md` - usa el truco de `sslip.io` para
tener un hostname válido sin comprar dominio, y así Let's Encrypt sí te
emite un certificado real contra tu IP del droplet.

## 8. Verificar todo

- `https://<tu-ip-o-sslip-host>` → panel admin (React Native Web).
- `https://<tu-ip-o-sslip-host>/health` → API pública (sin prefijo `/api`, así está expuesto en nginx.conf).
- `http://<tu-ip>:3002` → Grafana (usuario `admin`, la contraseña que
  pusiste en `.env`), con los dashboards **SIFUT API Monitoring** y
  **SIFUT Firewall Monitoring**.

## 9. Último paso: apuntar la app móvil aquí

`src/services/api.js` todavía apunta la build nativa a tu IP de LAN.
Antes de generar el APK final para el teléfono de los evaluadores,
cambia esa URL a `https://<tu-ip-o-sslip-host>/api` (ver tarea de build
de APK).
