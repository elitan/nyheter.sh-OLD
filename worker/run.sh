#!/bin/bash

while true; do
    pnpm start
    pnpm transcribe
    pnpm openai
    pnpm su
    pnpm elevenlabs

    for (( i=1200; i>=0; i-- )); do
        echo "$i"
        # Try to read a key press with a timeout of 1 second
        read -t 1 -n 1 input
        if [[ $input = "" ]]; then
            continue
        else
            # If Enter is pressed, break out of the countdown loop
            if [[ $input = $'\n' ]]; then
                break
            fi
        fi
    done
done