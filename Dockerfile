FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html/

# Remove arquivos de deploy da pasta pública
RUN rm -f /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/.gitignore

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
