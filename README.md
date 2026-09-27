\# Affiliate Management Portal



A full-stack Affiliate Management Portal that allows users to apply for affiliate partnerships while administrators review applications, manage approvals, track affiliate performance, and configure monthly targets.



\## Features



\### Affiliate / User



\* Secure signup and login

\* JWT-based authentication

\* Role-based access control

\* Create and save affiliate applications as drafts

\* Edit applications before submission

\* Submit and resubmit applications

\* Track application status

\* View admin change requests

\* View affiliate referral code after approval

\* View clicks, conversions, revenue, and commission

\* View monthly performance targets

\* View target achievement progress

\* View activity history

\* Responsive dashboard



\### Admin



\* Secure admin authentication

\* Admin dashboard with application statistics

\* View all affiliate applications

\* Filter applications by status

\* View complete applicant details

\* Move applications to Under Review

\* Approve applications

\* Reject applications with a reason

\* Request changes from applicants

\* Automatically generate affiliate referral codes

\* Manage affiliate performance metrics

\* Manage monthly affiliate targets

\* View affiliate performance data

\* Responsive admin dashboard



\## Application Workflow



```text

Draft

&#x20; ↓

Submitted

&#x20; ↓

Under Review

&#x20; ├── Approved

&#x20; ├── Rejected

&#x20; └── Changes Requested

&#x20;          ↓

&#x20;       Resubmitted

&#x20;          ↓

&#x20;      Under Review

```



\## Tech Stack



\### Frontend



\* Next.js 16

\* React

\* TypeScript

\* Tailwind CSS



\### Backend



\* Node.js

\* Express.js

\* REST APIs



\### Database



\* MongoDB

\* Mongoose



\### Authentication \& Security



\* JWT

\* bcryptjs

\* Role-based authorization

\* Environment variables for secrets



\## Project Structure



```text

affiliate-management-portal/

│

├── client/

│   ├── app/

│   │   ├── admin/

│   │   ├── affiliate/

│   │   ├── page.tsx

│   │   └── ...

│   ├── public/

│   └── package.json

│

├── server/

│   ├── config/

│   ├── controllers/

│   ├── middleware/

│   ├── models/

│   ├── routes/

│   ├── scripts/

│   ├── .env

│   ├── server.js

│   └── package.json

│

├── .gitignore

└── README.md

```



\## Getting Started



\### Prerequisites



Make sure the following are installed:



\* Node.js

\* npm

\* MongoDB Atlas account or MongoDB instance

\* Git



\### Clone Repository



```bash

git clone https://github.com/anmolsrivastava017/affiliate-management-portal.git

cd affiliate-management-portal

```



\## Backend Setup



Open a terminal inside the project root:



```bash

cd server

npm install

```



Create a `.env` file inside the `server` directory:



```env

PORT=5000

MONGO\_URI=your\_mongodb\_connection\_string

JWT\_SECRET=your\_jwt\_secret

```



Start the backend:



```bash

node server.js

```



The backend runs on:



```text

http://localhost:5000

```



\## Frontend Setup



Open another terminal:



```bash

cd client

npm install

npm run dev

```



The frontend runs on:



```text

http://localhost:3000

```



\## API Overview



\### Authentication



```text

POST /api/auth/register

POST /api/auth/login

GET  /api/auth/me

```



\### Applications



```text

POST /api/applications/

GET  /api/applications/me

PUT  /api/applications/:id

POST /api/applications/:id/submit

```



\### Admin



```text

GET /api/admin/dashboard

GET /api/admin/applications

GET /api/admin/applications/:id

PUT /api/admin/applications/:id/review

PUT /api/admin/applications/:id/approve

PUT /api/admin/applications/:id/reject

PUT /api/admin/applications/:id/request-changes

GET /api/admin/affiliates

PUT /api/admin/affiliates/:id/metrics

PUT /api/admin/affiliates/:id/targets

```



\### Affiliate



```text

GET /api/affiliate/dashboard

```



\### Activity



```text

GET /api/activities/me

```



\## Test Credentials



\### Admin



```text

Email: admin@affiliate.com

Password: Admin@12345

```



\### Affiliate



```text

Email: anmoltest@gmail.com

Password: 12345678

```



These credentials are provided for evaluation and demonstration purposes.



\## Security



\* Passwords are hashed using bcrypt before storage.

\* JWT tokens are used for authentication.

\* Protected routes require authentication.

\* Admin routes require admin authorization.

\* Database credentials and JWT secrets are stored in environment variables.

\* `.env` files are excluded from Git using `.gitignore`.



\## Affiliate Performance



After approval, an affiliate can view:



\* Total clicks

\* Total conversions

\* Revenue generated

\* Commission earned

\* Monthly click target

\* Monthly conversion target

\* Monthly revenue target

\* Conversion rate

\* Referral code

\* Activity history



Administrators can manually update performance metrics and targets.



\## Technical Decisions



\### Next.js + Express



Next.js is used for the frontend because of its modern React architecture and routing capabilities, while Express provides a dedicated backend API layer.



\### MongoDB + Mongoose



MongoDB provides a flexible document-based data model suitable for applications, users, affiliates, and activity records. Mongoose provides schema validation and structured database access.



\### JWT Authentication



JWT provides stateless authentication between the frontend and backend APIs.



\### bcrypt Password Hashing



Passwords are securely hashed using bcrypt rather than storing plaintext passwords.



\### Role-Based Access Control



The system separates Affiliate and Admin permissions so administrative operations are restricted to authorized users.



\## UI \& UX



The portal uses separate visual experiences for Affiliate and Admin users.



\### Affiliate Dashboard



\* Growth-focused visual language

\* Performance KPI cards

\* Target progress indicators

\* Referral information

\* Activity timeline

\* Responsive layouts



\### Admin Dashboard



\* Enterprise-style administration interface

\* Application management

\* Review workflow

\* Affiliate management

\* Performance metrics

\* Target configuration

\* Status indicators

\* Responsive layouts



\## Future Improvements



\* Production deployment

\* Real-time referral tracking

\* Automated commission calculations

\* Email notifications

\* Advanced analytics

\* Exportable reports

\* Pagination and advanced search

\* Automated affiliate payout management



\## Author



\*\*Anmol Srivastava\*\*



B.Tech CSE | Full-Stack Developer



GitHub: https://github.com/anmolsrivastava017



LinkedIn: https://linkedin.com/in/anmol-srivastava-dev



