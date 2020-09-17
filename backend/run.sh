#!/usr/bin/env bash

pid=0

# SIGTERM-handler
term_handler() {
    if [ $pid -ne 0 ]; then
        kill -SIGTERM "$pid"
        wait "$pid"
    fi
    exit 143; # 128 + 15 -- SIGTERM
}

# SIGINT-handler
int_handler() {
    if [ $pid -ne 0 ]; then
        kill -SIGINT "$pid"
        wait "$pid"
    fi
    exit 130; # 128 + 2 -- SIGINT
}

# SIGHUP-handler
hup_handler() {
    if [ $pid -ne 0 ]; then
        kill -SIGHUP "$pid"
        wait "$pid"
    fi
    exit 129; # 128 + 1 -- SIGHUP
}

# on SIGTERM, SIGNINT OR SIGHUP, kill the last background process, which is `tail -f /dev/null`
# and execute handler
trap 'kill ${!}; term_handler' SIGTERM
trap 'kill ${!}; int_handler' SIGINT
trap 'kill ${!}; hup_handler' SIGHUP

# the redirection trick makes sure that $! is the pid
# of the "node build/index.js" process
node src/server.js > >(bunyan -o short) &
pid="$!"

# wait forever
while true
do
    tail -f /dev/null &
    wait ${!}
done
