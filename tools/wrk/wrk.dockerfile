# tools/wrk/wrk.dockerfile
FROM alpine:3.18 AS builder

# 1) Install build tools, Perl, OpenSSL dev headers, and Git
RUN apk add --no-cache \
      build-base \
      linux-headers \
      git \
      perl \
      openssl-dev

# 2) Clone and build wrk
RUN git clone https://github.com/wg/wrk.git /wrk \
 && cd /wrk \
 && make

# ─── Final Stage ────────────────────────────────────────────────────────────────
FROM alpine:3.18

# Install only the runtime libs that wrk needs
RUN apk add --no-cache \
      libgcc \
      libstdc++

# Copy the compiled wrk binary from the builder
COPY --from=builder /wrk/wrk /usr/local/bin/

ENTRYPOINT ["wrk"]