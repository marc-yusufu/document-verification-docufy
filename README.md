DOCUMENT VERIFICATION SYSTEM: 

Group name: Bug Slayers

CONTRIBUTORS: 

-MD Lichaba - Designer, Backend.

-TL Monyeki - Business Analyst.

-M Yusufu - Frontend, Backend.

-S Hokwana - Project Manager, Frontend.

-N Moses - Business Analyst.

-KO Mooketsi - Designer.

A web-based document verification system designed to ensure the authenticity of user-submitted documents while maintaining a required level of human oversight.
This project streamlines the verification workflow for organisations that need to validate user documents (such as IDs, certificates, or permits) 
but still requires an admin to confirm authenticity in accordance with regulations.

FEATURES: 

-User Upload Portal — Users can securely upload documents in PDF or image format.

-Automatic Conversion & Processing — Uploaded images are processed using OpenCV.js and converted to PDF with jsPDF.

-Unique Code Stamping — Each document receives a unique 6-character alphanumeric stamp for tracking and validation.

-Admin Verification Dashboard — Admins (workers or supervisors) can view all submitted documents and confirm authenticity.

-Supabase Integration — Handles authentication, database storage, and role-based access (user/admin).

-Real-Time Updates — When a user uploads a document, it appears dynamically on the home page; re-uploads replace previous versions.


TECH STACK:

-Frontend: React + TypeScript + Ionic Framework

-Backend & Database: Supabase

-Processing: OpenCV.js, jsPDF

-Styling: Tailwind CSS


SET UP AND HOW TO RUN: 

-Clone the repository: 
git clone https://github.com/yourusername/document-verification.git

-Change directory to user-front-end:
run the following: 
1. yarn
2. yarn dev

-Change directory to admin-front-end:
run the following:
1. npm install
2. npm run dev

-Change directory to the backend:
run the following:
1. npm install
2. node server.js

ROLES AND ACCESS CONTROL: 

-User:	Upload and view their own documents

-Admin/Worker/Supervisor:	View all user submissions and verify authenticity


DESIGN DECISION:

We chose to keep human verification as part of the process because, according to document verification regulations, an admin must visually inspect and confirm each document’s authenticity.

FUTURE IMPROVEMENTS:

-Integration with government APIs for automatic verification.

-AI-based document fraud detection.

-Email or SMS notification system for verification updates.

-Audit logs for admin verification actions.


