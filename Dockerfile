FROM cypress/included:15.3.0

WORKDIR /app

# Copy dependency files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY cypress.config.js ./
COPY cypress/ ./cypress/

# Create directories for reports and artifacts
RUN mkdir -p mochawesome-temp mochawesome-report

# Default command: run all tests and generate report
ENTRYPOINT []
CMD ["sh", "-c", "npx cypress run && npx mochawesome-merge mochawesome-temp/*.json -o mochawesome-report/merged.json && npx marge mochawesome-report/merged.json -f report -o mochawesome-report"]
