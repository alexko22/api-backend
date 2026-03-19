# Alex Olson - Technical Assessment Project

## Description
Implementation of a simple RESTful API backend for a mobile chat application.

---

## Time Taken
~7.5 hours

---

## Tech Stack
- Node.js
- Express.js
- MySQL

---

## Project Timeline / Summary

I started by carefully reviewing the project requirements to determine an appropriate backend framework. In previous projects, I had primarily used Django/Python or full-stack frameworks like Next.js, so building a JavaScript-focused backend was a newer experience for me. I ended up using Node.js/Express, as I had some prior exposure to Express and knew it to be an effective JS-based backend framework.

After setting up the project structure, installing dependencies, and initializing a GitHub repository, I moved on to configuring the MySQL database using MySQL Workbench. The schema I went with should be visible in the `/sql/schema_dump.sql` file in this repository. I then established a database connection, storing private credentials in a gitignored `.env` file.

From here, I created route and controller files to organize and define the API endpoints and began implementing the required functionality. I started with the user registration endpoint, first building a basic working version before adding validation and error handling for various scenarios such as duplicate accounts, missing fields, and internal errors. It was during this stage that I encountered a key issue where multiple responses could be triggered by a single request, causing the app to crash. I resolved this by restructuring using try/catch blocks where appropriate and nesting queries to ensure only one response is returned per request.

Once the first endpoint was complete, I followed a similar pattern when implementing the remaining endpoints. The registration endpoint served as a template that I adapted for the others by adjusting queries and error checks as needed. Throughout development, I tested each endpoint individually using Postman to ensure both success and error cases were handled correctly, debugging as needed.

Finally, I refined the codebase by clarifying comments and fixing minor issues and spelling mistakes. I exported the database schema as an SQL dump and included it in the repository. Throughout the process, I kept notes to assist with reflection and consulted various documentation, code snippets, and other resources to better understand the environment and syntax.

---

## Potential Issues with Endpoint Structure

The current endpoints satisfy the project requirements, but there are definitely some issues that could arise (and some that already have). For example, having to pass user information directly through each request is not as convenient as having some form of authentication that keeps a user logged in and recognized. In the current implementation, even if a user “logs in” via the login endpoint, they are still treated as any other user by endpoints like `/send_message` or `/list_all_users`, and must manually provide their ID each time.

There are also security concerns related to this approach, which I will address in the following section. Additionally, when retrieving data, there is no efficient way to parse or navigate through large datasets. For example, there could be many messages or users returned in a single response, requiring manual searching to find a specific item. With the current endpoint structure, features such as pagination or search functionality would be important improvements.

---

## Improvements (Security, Usability, API Design)

The current implementation works sufficiently for the scope of the project, but there are definitely a few areas where improvements could be made in terms of security, usability, and overall API design.

### Security
From a security standpoint, the largest limitation is the lack of authentication beyond the login endpoint. While users are able to "log in", that state is not maintained across requests, meaning any user can perform actions such as sending messages or listing users simply by providing a valid user ID. A more secure approach would involve implementing some kind of token-based or alternative authentication system so that endpoints can verify the identity of the requester without relying on client-supplied IDs.

Additionally, data validation could likely be strengthened further to reduce the risk of malformed or unsafe inputs. A few steps taken to improve security in the current implementation include hashing passwords using bcrypt and using `?` placeholders to help prevent SQL injection attacks.

### Usability
In terms of usability, the current endpoints return full datasets without any filtering, pagination, or search capabilities. This works for small amounts of data, but would become difficult to manage at scale, as users would need to manually parse large responses to find relevant information.

Adding pagination, sorting, or search functionality would make the API significantly more practical to use in a real application. There is also some redundancy in requiring the user to repeatedly provide their ID for each request, which could be fixed through the aforementioned authentication or session handling.

### API Design
From an API design perspective, the endpoints are clear and functional, but could be improved to better support user context and interaction. Currently, endpoints rely on manually passing user IDs, which makes it difficult to tie actions directly to an authenticated user.

A more robust design would allow endpoints to derive the acting user from authentication (such as a token), making interactions more seamless and reducing redundancy in requests. Additionally, endpoint naming could be potentially simplified, especially in a larger application where many actions might exist for a single resource (such as sending, editing, or deleting messages). In those cases, a more resource-based structure would help keep the API organized and scalable as additional functionality is introduced.

---

### Running Locally
1. Clone the repo
2. Install dependencies (npm install; my node modules are just .gitignored)
3. Open MySQL workbench and make your own database using the dump file schema
4. Create a .env file in the root directory with your relevant `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `PORT` values.
5. Start the server and the API should be running at the relevant localhost!

### Final Note
Special thanks to everyone at Giftogram who took the time to speak with me and review my code!!!

