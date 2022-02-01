FROM brutalsimplicity/cicd-container:v1.0.0

COPY package.json /workspace/package.json
COPY package-lock.json /workspace/package-lock.json

WORKDIR /workspace
RUN npm ci
