#!/bin/bash

while true; do
    pnpm start
    pnpm transcribe
    pnpm openai
    pnpm su
    pnpm elevenlabs
    for (( i=1200; i>=0; i-- )); do
        echo "$i"
        sleep 1
    done
done