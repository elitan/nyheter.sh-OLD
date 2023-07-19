## BUILDER
FROM alpine:3.14 as builder

RUN apk update && \
    apk add --no-cache g++ make bash sdl2-dev alsa-utils build-base curl  git

WORKDIR /build

# whisper.cpp
RUN git clone https://github.com/ggerganov/whisper.cpp.git
WORKDIR /build/whisper.cpp
RUN make

## RUNNER
FROM alpine:3.14 as runner

RUN apk update && \
    apk add --no-cache bash ffmpeg curl python3 py3-yaml py3-requests py3-cryptography git

WORKDIR /app

COPY --from=builder /build/whisper.cpp/main ./
RUN mv main whisper
RUN mv whisper /usr/local/bin/whisper

# SVTPlay-DL
RUN curl -L https://svtplay-dl.se/download/latest/svtplay-dl -o /usr/local/bin/svtplay-dl
RUN chmod a+rx /usr/local/bin/svtplay-dl

COPY models models
COPY main.sh main.sh
RUN chmod +x main.sh

## tail 
CMD ["sleep", "infinity"]
# ENTRYPOINT ["/app/main.sh"]