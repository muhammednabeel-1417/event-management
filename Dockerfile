# =========================================================================
# Red Hat OpenShift Certified Container Image
# Base: Red Hat Universal Base Image (UBI 9) with Nginx 1.22
# Runs as non-root user (UID 1001 / root group 0) - OpenShift SCC Compliant
# =========================================================================

FROM registry.access.redhat.com/ubi9/nginx-122:latest

LABEL name="elite-events" \
      version="1.0.0" \
      summary="Élite Events Management Website on Red Hat OpenShift" \
      description="Production-grade, secure, cloud-native frontend web server for OpenShift" \
      io.k8s.description="Élite Events Management Website" \
      io.k8s.display-name="Élite Events" \
      io.openshift.expose-services="8080:http" \
      io.openshift.tags="builder,nginx,html5,css3,javascript"

USER root

# Remove default RHEL / UBI placeholder pages
RUN rm -rf /opt/app-root/src/* /usr/share/nginx/html/*

# Copy website assets
COPY --chown=1001:0 . /opt/app-root/src/

# Copy custom Nginx configuration optimized for OpenShift
COPY --chown=1001:0 nginx.conf /etc/nginx/nginx.conf

# Mirror to /usr/share/nginx/html and ensure group 0 permissions (standard OpenShift convention)
RUN cp -rf /opt/app-root/src/* /usr/share/nginx/html/ && \
    chmod -R g=u /opt/app-root/src /usr/share/nginx/html /etc/nginx /var/log/nginx /run /tmp

# Switch back to non-root user (UID 1001)
USER 1001

# Expose unprivileged port 8080
EXPOSE 8080

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
