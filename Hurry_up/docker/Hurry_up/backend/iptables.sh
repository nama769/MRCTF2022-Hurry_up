#!/bin/bash
iptables-legacy -P OUTPUT DROP
iptables-legacy -A OUTPUT -d $REDIS_IP -j ACCEPT
iptables-legacy -A OUTPUT -d $GATEWAY_HOST -j ACCEPT
iptables-legacy -A INPUT -p tcp -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables-legacy -A OUTPUT -p tcp -m state --state ESTABLISHED,RELATED -j ACCEPT
su - node -c "node /app/app.js"