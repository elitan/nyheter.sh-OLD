#!/bin/bash

# Check if file name is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 filename"
    exit 1
fi

srlink=$1

# You can then use the filename variable in your script
echo "SR link is: $srlink"

# Collecting time for svtplay-dl
start=$(date +%s)
svtplay-dl $srlink --force -o /tmp/whisper/raw
end=$(date +%s)
time_svtplay=$(($end - $start))
echo "svtplay-dl took $time_svtplay seconds."

# Collecting time for ffmpeg
start=$(date +%s)
ffmpeg -y -i /tmp/whisper/raw.mp4 -ar 16000 /tmp/whisper/converted.wav
end=$(date +%s)
time_ffmpeg=$(($end - $start))
echo "ffmpeg conversion took $time_ffmpeg seconds."

# Collecting time for main program
start=$(date +%s)
./whisper -m models/ggml-large.bin -l sv -nt -f /tmp/whisper/converted.wav
end=$(date +%s)
time_main=$(($end - $start))
echo "main program took $time_main seconds."

# Print total time
total_time=$(($time_svtplay + $time_ffmpeg + $time_main))
echo "Total time taken: $total_time seconds."