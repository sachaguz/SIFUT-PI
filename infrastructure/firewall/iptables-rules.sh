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
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP (port 80) - redirects to HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Allow HTTPS (port 443) - main entry point
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Block direct access to backend ports from outside
# (3000, 3001 only accessible through nginx within Docker network)
iptables -A INPUT -p tcp --dport 3000 -j DROP
iptables -A INPUT -p tcp --dport 3001 -j DROP

# Block direct access to Prometheus (9090) from outside
iptables -A INPUT -p tcp --dport 9090 -j DROP

# Allow Grafana on port 3002 (monitoring dashboard)
iptables -A INPUT -p tcp --dport 3002 -j ACCEPT

# Rate limiting: max 25 new connections/second per IP
iptables -A INPUT -p tcp --syn -m limit --limit 25/s --limit-burst 50 -j ACCEPT
iptables -A INPUT -p tcp --syn -j DROP

# Drop invalid packets
iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

# Log dropped packets (last 5/min to avoid log flooding)
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "SIFUT_FIREWALL_DROP: "
iptables -A INPUT -j DROP

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
