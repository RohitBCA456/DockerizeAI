DockerizeAI 🐳🤖
================

**DockerizeAI** is an intelligent DevOps assistant designed to automate and simplify the containerization workflow for modern software projects. By leveraging the power of Large Language Models, it analyzes your codebase, understands its architecture, and generates production-ready Dockerfiles and docker-compose.yml configurations with minimal human intervention.

\## Core Philosophy
-------------------

The primary goal of DockerizeAI is to **reduce the cognitive load** associated with DevOps tasks. Writing efficient, secure, and optimized Dockerfiles requires specialized knowledge. This project encapsulates that knowledge within an AI agent, allowing developers to focus on writing code rather than managing infrastructure. It acts as an expert pair programmer for all things containerization.

\## System Architecture
-----------------------

DockerizeAI operates on a simple yet powerful server-based architecture. The user interacts with a REST API, which orchestrates the scanning and generation process.

1.  **API Server (Express.js)**: The entry point for all requests. It handles routing, request validation, and orchestrates the workflow.
    
2.  **Repository Scanner (repoScanner.js)**: A specialized module that recursively scans a given file path. It acts as the "eyes" of the system, gathering crucial metadata about the project structure, dependencies, and environment.
    
3.  **AI Agent (agent.js)**: The "brain" of the operation. It receives the structured metadata from the scanner and uses it to construct a highly detailed prompt for the Large Language Model (e.g., Google's Gemini).
    
4.  **LLM (Gemini)**: The core generative engine. It processes the prompt and returns the formatted Dockerfile and Docker Compose content as a JSON object.
    

\## Feature Deep Dive
---------------------

### \### Intelligent Repository Scanner

The scanner is more than a simple file lister. It actively looks for context clues to build a rich profile of each service in the repository.

*   **Language Detection**: Identifies services by looking for key manifest files:
    
    *   package.json -> **Node.js**
        
    *   requirements.txt -> **Python**
        
*   **Dependency Analysis**: Extracts all dependencies and devDependencies from package.json or packages from requirements.txt. This list is passed to the AI so it can make informed decisions (e.g., using nodemon for a development CMD script).
    
*   **Auxiliary Service Detection**: Parses .env files for keywords related to common backing services like databases, caches, and message brokers (postgres, mongodb, redis, rabbitmq). This allows the AI to automatically add these services to the docker-compose.yml.
    
*   **Configuration Extraction**: Reads port numbers and entry point scripts (main in package.json) to ensure the generated Dockerfiles are correctly configured.
    

### \### Advanced AI Prompt Engineering

The quality of the AI's output is directly proportional to the quality of the prompt. We don't just ask it to "make a Dockerfile." Instead, we provide a rich, structured context.

A simplified version of the data sent to the AI looks like this:

JSON

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "services": {      "backend": {        "type": "node",        "path": "/path/to/project/backend",        "entryPoint": "server.js",        "port": 3000,        "dependencies": ["express", "mongoose", "nodemon"],        "hasEnvFile": true      }    },    "requiredServices": ["mongodb"]  }   `

This detailed metadata allows the AI to precisely tailor the Dockerfile and docker-compose.yml to the project's exact requirements.

### \### RAG-Powered Documentation Agent

The /scrape-and-query endpoint uses a Retrieval-Augmented Generation (RAG) pipeline.

1.  **Scrape**: It fetches and cleans documentation from a specified URL.
    
2.  **Ingest**: The text is broken into chunks and converted into vector embeddings, which are stored in a vector database.
    
3.  **Retrieve & Generate**: When a user asks a question, the agent finds the most relevant chunks of documentation from the database and feeds them to the LLM along with the question, allowing for accurate, context-aware answers.
    

\## API Specification
---------------------

### \### POST /generate-docker

Generates the content for Dockerfiles and Docker Compose files for review.

*   JSON{ "repoPath": "/path/to/your/local/project"}
    
*   JSON{ "message": "Docker files generated. Please review before writing to disk.", "filesToWrite": { "/path/to/project/backend/Dockerfile": "...", "/path/to/project/docker-compose.yml": "..." }}
    
*   **Error Responses**:
    
    *   400 Bad Request: If repoPath is missing, not an absolute path, or does not exist.
        
    *   500 Internal Server Error: If the AI model fails or an unexpected error occurs.
        

### \### POST /write-docker-files

Writes the reviewed file content to the disk.

*   JSON{ "filesToWrite": { "/path/to/project/backend/Dockerfile": "...", "/path/to/project/docker-compose.yml": "..." }}
    
*   JSON{ "message": "Files written successfully!", "createdFiles": \["/path/to/project/backend/Dockerfile", "..."\]}
    
*   **Error Responses**:
    
    *   400 Bad Request: If filesToWrite is missing or empty.
        
    *   500 Internal Server Error: If there's a file system permission error or other issue during the write process.
        

\## Environment Configuration
-----------------------------

Create a .env file in the project root to configure the server.

VariableDescriptionRequiredDefaultGEMINI\_API\_KEYYour API key for the Google Gemini model.**Yes**nullPORTThe port for the Express server to run on.No4000Export to Sheets

\## Installation and Setup
--------------------------

1.  Bashgit clone https://github.com/your-username/dockerize-ai.gitcd dockerize-ai
    
2.  Bashnpm install
    
3.  Code snippet# .envGEMINI\_API\_KEY="YOUR\_API\_KEY\_HERE"
    
4.  Bashnpm startThe server is now live at http://localhost:4000.
    

\## Usage Walkthrough
---------------------

Let's containerize a sample project located at /Users/dev/my-app.

1.  Bashcurl -X POST -H "Content-Type: application/json" \\-d '{"repoPath": "/Users/dev/my-app"}' \\http://localhost:4000/generate-dockerThe server will respond with a JSON object containing the proposed file paths and their content. Review this content to ensure it meets your expectations.
    
2.  Bashcurl -X POST -H "Content-Type: application/json" \\-d '{ "filesToWrite": { "/Users/dev/my-app/backend/Dockerfile": "...", "..." } }' \\http://localhost:4000/write-docker-filesThe server will confirm that the files have been successfully written to your project directory. You can now use docker-compose up --build to run your newly containerized application.
    

\## Contributing
----------------

Contributions are welcome! Please follow these steps to contribute:

1.  Fork the repository.
    
2.  Create a new branch (git checkout -b feature/your-feature-name).
    
3.  Make your changes and commit them (git commit -m 'Add some feature').
    
4.  Push to the branch (git push origin feature/your-feature-name).
    
5.  Open a Pull Request.
    

\## Future Roadmap 🚀
---------------------

*   \[ \] **Support for More Languages**: Add scanners for Go (go.mod), Rust (Cargo.toml), and Java (pom.xml).
    
*   \[ \] **Multi-Stage Dockerfiles**: Add an option to generate optimized, multi-stage Dockerfiles for production builds.
    
*   \[ \] **Kubernetes Manifests**: Extend the AI's capability to generate basic Kubernetes deployment and service manifests.
    
*   \[ \] **CI/CD Pipeline Generation**: Generate starter configuration files for GitHub Actions or GitLab CI."# DockerizeAI" 
