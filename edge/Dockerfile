FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY maintenance.html /usr/share/nginx/html/maintenance.html
RUN mkdir -p /etc/nginx/flags
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:8080/__edge_health >/dev/null || exit 1
