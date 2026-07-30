# Certificado SSL

Por defecto `generate-certs.sh` crea un certificado autofirmado (válido
para trabajar en `localhost` o en una red local, pero el navegador lo
marca como "no seguro"). Para la nube, sigue estos pasos para obtener un
certificado real y gratuito de Let's Encrypt **sin necesidad de comprar
un dominio**, usando `sslip.io` (resuelve `<ip-con-guiones>.sslip.io` a
esa misma IP automáticamente).

1. Con el droplet/VM ya corriendo y con el puerto 80 abierto y apuntando
   a este nginx (`docker compose up -d`), anota tu IP pública, por
   ejemplo `164.92.123.45`.

2. Corre certbot una sola vez, en modo webroot, compartiendo la misma
   carpeta que nginx ya sirve en `/var/www/certbot`:

   ```bash
   HOST="164-92-123-45.sslip.io"   # guiones, no puntos
   docker run --rm \
     -v "$(pwd)/infrastructure/certbot-webroot:/var/www/certbot" \
     certbot/certbot certonly --webroot -w /var/www/certbot \
     -d "$HOST" --email tu-correo@ejemplo.com --agree-tos --non-interactive
   ```

   El certificado queda en
   `/etc/letsencrypt/live/<HOST>/{fullchain.pem,privkey.pem}` **dentro
   de ese contenedor efímero**, así que cópialo a un volumen persistente
   antes de que se borre (o monta también `-v $(pwd)/infrastructure/letsencrypt:/etc/letsencrypt`
   para que quede en el host).

3. Reemplaza los archivos que nginx ya monta (no hace falta tocar
   `nginx.conf`):

   ```bash
   sudo cp infrastructure/letsencrypt/live/$HOST/fullchain.pem infrastructure/ssl/server.crt
   sudo cp infrastructure/letsencrypt/live/$HOST/privkey.pem infrastructure/ssl/server.key
   docker compose restart nginx
   ```

4. Verifica en el navegador: `https://<HOST>` debe mostrar el candado
   verde sin advertencias.

**Renovación**: el certificado dura 90 días. Para una presentación no
hace falta automatizarlo, pero si quieres dejarlo corriendo más tiempo,
repite el paso 2-3 antes de que expire (o agenda un cron con
`certbot renew` + el mismo `cp` + `restart nginx`).
