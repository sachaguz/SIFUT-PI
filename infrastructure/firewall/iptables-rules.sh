#!/bin/bash
# SIFUT Firewall Rules
# Run with: sudo bash iptables-rules.sh
set -e

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F

# Default policies: deny all incoming, allow outgoing
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established/related connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (port 22)
iptables -A INPUT -p tcp --dport 22 -m comment --comment "sifut_ssh_allow" -j ACCEPT

# Allow HTTP (port 80) - redirects to HTTPS
iptables -A INPUT -p tcp --dport 80 -m comment --comment "sifut_http_allow" -j ACCEPT

# Allow HTTPS (port 443) - main entry point
iptables -A INPUT -p tcp --dport 443 -m comment --comment "sifut_https_allow" -j ACCEPT

# Block direct access to backend ports from outside
# (3000, 3001 only accessible through nginx within Docker network)
iptables -A INPUT -p tcp --dport 3000 -m comment --comment "sifut_api_block" -j DROP
iptables -A INPUT -p tcp --dport 3001 -m comment --comment "sifut_api_private_block" -j DROP

# Block direct access to Prometheus (9090) from outside
iptables -A INPUT -p tcp --dport 9090 -m comment --comment "sifut_prometheus_block" -j DROP

# Allow Grafana on port 3002 (monitoring dashboard)
iptables -A INPUT -p tcp --dport 3002 -m comment --comment "sifut_grafana_allow" -j ACCEPT

# Rate limiting: max 25 new connections/second per IP
iptables -A INPUT -p tcp --syn -m limit --limit 25/s --limit-burst 50 -m comment --comment "sifut_syn_accept" -j ACCEPT
iptables -A INPUT -p tcp --syn -m comment --comment "sifut_syn_flood_drop" -j DROP

# Drop invalid packets
iptables -A INPUT -m conntrack --ctstate INVALID -m comment --comment "sifut_invalid_drop" -j DROP

# Log dropped packets (last 5/min to avoid log flooding)
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "SIFUT_FIREWALL_DROP: "
iptables -A INPUT -m comment --comment "sifut_default_drop" -j DROP

echo "Firewall rules applied successfully"
echo ""
echo "Open ports:"
echo "  22   - SSH"
echo "  80   - HTTP (redirects to HTTPS)"
echo "  443  - HTTPS (nginx reverse proxy)"
echo "  3002 - Grafana monitoring"
echo ""
echo "Blocked ports:"
echo "  3000 - Backend API (internal only)"
echo "  3001 - Backend Private API (internal only)"
echo "  9090 - Prometheus (internal only)"
echo ""
echo "To monitor these rules in Grafana, schedule export-metrics.sh via cron"
echo "(as root's own crontab, so no 'root' user field - that's only for"
echo "/etc/crontab):"
echo "  * * * * * $(dirname "$0")/export-metrics.sh"
