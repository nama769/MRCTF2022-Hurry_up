FROM node:16

COPY src /app
COPY ./sources.list /etc/apt/sources.list
COPY ./flag /flag
COPY ./iptables.sh /home/iptables.sh 
COPY ./env.sh /etc/profile.d/env.sh

# install dependencies
WORKDIR /app

RUN chmod 111 /home/iptables.sh  && \
    chmod 444 /flag  && \
    apt-get update && \
    apt-get install npm -y && \
    npm install && \
    apt-get install iptables -y

USER root

CMD /home/iptables.sh
