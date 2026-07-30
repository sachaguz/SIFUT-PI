#!/bin/bash
# Reads iptables' own packet/byte counters for the rules tagged in
# iptables-rules.sh (via -m comment) and republishes them as a Prometheus
# textfile so node-exporter can pick them up - this is the "monitoreo"
# half of the firewall requirement, the rules themselves are the
# "aplicación" half.
#
# Run as root (iptables -L needs it) on a schedule, e.g. via cron:
#   * * * * * root /path/to/export-metrics.sh
set -e

OUT_DIR="${TEXTFILE_DIR:-/var/lib/node_exporter/textfile_collector}"
OUT_FILE="$OUT_DIR/firewall.prom"
TMP_FILE="$(mktemp)"

mkdir -p "$OUT_DIR"

{
  echo "# HELP sifut_firewall_packets_total Packets matched per SIFUT firewall rule since the rules were last (re)applied"
  echo "# TYPE sifut_firewall_packets_total counter"
  echo "# HELP sifut_firewall_bytes_total Bytes matched per SIFUT firewall rule since the rules were last (re)applied"
  echo "# TYPE sifut_firewall_bytes_total counter"

  iptables -L INPUT -v -n -x | grep -oP '^\s*\K\d+\s+\d+.*/\* sifut_\S+ \*/' | while read -r pkts bytes rest; do
    rule="$(echo "$rest" | grep -oP '(?<=/\* )sifut_\S+(?= \*/)')"
    echo "sifut_firewall_packets_total{rule=\"$rule\"} $pkts"
    echo "sifut_firewall_bytes_total{rule=\"$rule\"} $bytes"
  done
} > "$TMP_FILE"

mv "$TMP_FILE" "$OUT_FILE"
