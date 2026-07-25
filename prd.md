# PRODUCT REQUIREMENT DOCUMENT (PRD)
# JURNAL TK - TK DHARMA WANITA KEPUNG 2

> IMPORTANT:
> Build this project incrementally.
> DO NOT generate all features at once.
> Complete each phase sequentially and wait for approval before continuing to the next phase.
> Every phase must be fully functional before moving to the next one.

---

## PROJECT OVERVIEW

Jurnal TK is a Progressive Web Application (PWA) for TK Dharma Wanita Kepung 2 that serves as a digital communication book between teachers and parents.

Primary users:

1. Admin
2. Teacher
3. Parent

Core feature:

> Teachers create daily activity reports with photos, and parents can monitor their children's activities.

---

## TECH STACK

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Shadcn UI
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- TanStack Query
- Zustand
- React Hook Form
- Zod
- next-pwa
- Vercel

---

# DEVELOPMENT RULES

1. Build one phase at a time.
2. Never skip a phase.
3. Every phase must include:
   - Folder structure
   - Components
   - Pages
   - Database migration
   - Types
   - Services
   - Validation
   - UI implementation
4. Wait for confirmation before proceeding.
5. Keep code modular.
6. Use Server Components whenever possible.
7. Use Supabase Row Level Security.
8. Make the application mobile-first.

---

# PHASE 1
# PROJECT INITIALIZATION

## Objective

Initialize the project and prepare the development environment.

### Tasks

- Create Next.js project.
- Configure TypeScript.
- Configure TailwindCSS.
- Install Shadcn UI.
- Configure ESLint.
- Configure Prettier.
- Setup App Router.
- Setup folder structure.
- Setup PWA.
- Configure environment variables.

### Deliverables

```text
src/
│
├── app
├── components
├── hooks
├── lib
├── services
├── store
├── types
├── utils
└── providers
```

### Expected Result

- Application runs successfully.
- Tailwind works.
- Shadcn works.
- PWA works.
- Project can be deployed.

### STOP HERE

Wait for approval before moving to Phase 2.

---

# PHASE 2
# SUPABASE SETUP

## Objective

Configure Supabase and connect the application.

### Tasks

- Create Supabase project.
- Configure PostgreSQL.
- Connect Next.js to Supabase.
- Setup environment variables.
- Configure storage bucket.
- Configure Row Level Security.

### Storage Buckets

```text
student-photos
activity-photos
reports
```

### Deliverables

- Supabase connection.
- Storage buckets.
- Database access.
- Authentication ready.

### STOP HERE

Wait for approval before moving to Phase 3.

---

# PHASE 3
# DATABASE DESIGN

## Objective

Build the database schema.

### Tables

#### users

```sql
id
name
email
role
created_at
```

#### teachers

```sql
id
user_id
phone
```

#### parents

```sql
id
user_id
phone
```

#### students

```sql
id
name
class_id
parent_id
birth_date
photo
```

#### classes

```sql
id
name
teacher_id
```

#### academic_years

```sql
id
name
is_active
```

#### activities

```sql
id
teacher_id
class_id
title
description
activity_date
status
```

#### activity_photos

```sql
id
activity_id
image_url
```

### Deliverables

- SQL migrations.
- RLS policies.
- Seed data.

### STOP HERE

Wait for approval before moving to Phase 4.

---

# PHASE 4
# AUTHENTICATION

## Objective

Implement authentication.

### Features

- Login.
- Logout.
- Forgot Password.
- Protected Routes.
- Role-based Access.

### Roles

```text
ADMIN
TEACHER
PARENT
```

### Pages

```text
/login
/forgot-password
```

### Deliverables

- Working authentication.
- Session management.
- Middleware protection.

### STOP HERE

Wait for approval before moving to Phase 5.

---

# PHASE 5
# ADMIN DASHBOARD

## Objective

Create the Admin dashboard.

### Features

- Total Teachers.
- Total Students.
- Total Parents.
- Total Classes.

### Pages

```text
/admin
/admin/teachers
/admin/parents
/admin/students
/admin/classes
```

### Deliverables

- Dashboard cards.
- Statistics.
- Navigation sidebar.

### STOP HERE

Wait for approval before moving to Phase 6.

---

# PHASE 6
# MASTER DATA MANAGEMENT

## Objective

Build CRUD modules.

### Features

#### Teachers

- Create
- Read
- Update
- Delete

#### Parents

- Create
- Read
- Update
- Delete

#### Students

- Create
- Read
- Update
- Delete

#### Classes

- Create
- Read
- Update
- Delete

### Deliverables

- Complete CRUD.
- Search.
- Pagination.
- Validation.

### STOP HERE

Wait for approval before moving to Phase 7.

---

# PHASE 7
# TEACHER DASHBOARD

## Objective

Build the teacher workspace.

### Features

- Today's Activities.
- Activity Count.
- Quick Actions.

### Pages

```text
/teacher
```

### Deliverables

- Teacher dashboard.
- Responsive UI.

### STOP HERE

Wait for approval before moving to Phase 8.

---

# PHASE 8
# PAPAN KEGIATAN (CORE FEATURE)

## Objective

Build the main feature.

### Features

- View activities.
- Create activities.
- Edit activities.
- Delete activities.
- Reorder activities.
- Publish activities.

### Example

```text
07:00 - Doa Pagi
08:00 - Bernyanyi
09:00 - Mewarnai
10:00 - Istirahat
```

### Pages

```text
/teacher/activities
/teacher/activities/new
/teacher/activities/[id]
```

### Deliverables

- Activity CRUD.
- Publish workflow.
- Timeline view.

### STOP HERE

Wait for approval before moving to Phase 9.

---

# PHASE 9
# PHOTO UPLOAD

## Objective

Add activity photos.

### Features

- Upload images.
- Delete images.
- Preview images.
- Multiple uploads.

### Rules

```text
Maximum:
- 5 photos
- 5 MB each
```

### Deliverables

- Supabase Storage integration.
- Image optimization.
- Preview component.

### STOP HERE

Wait for approval before moving to Phase 10.

---

# PHASE 10
# PARENT DASHBOARD

## Objective

Build parent experience.

### Features

- Child timeline.
- Recent activities.
- Gallery.
- Child profile.

### Pages

```text
/parent
/parent/timeline
/parent/gallery
/parent/profile
```

### Deliverables

- Parent dashboard.
- Timeline page.
- Gallery page.

### STOP HERE

Wait for approval before moving to Phase 11.

---

# PHASE 11
# REPORTS

## Objective

Build reporting module.

### Features

- Daily report.
- Weekly report.
- Monthly report.
- PDF export.

### Deliverables

- Report generator.
- PDF export.
- Preview.

### STOP HERE

Wait for approval before moving to Phase 12.

---

# PHASE 12
# POLISHING

## Objective

Improve UX and performance.

### Tasks

- Loading states.
- Error handling.
- Empty states.
- Skeleton UI.
- Mobile optimization.
- Accessibility.
- SEO.

### Deliverables

- Production-ready application.

### STOP HERE

Wait for approval before moving to Phase 13.

---

# PHASE 13
# DEPLOYMENT

## Objective

Deploy application.

### Tasks

- Configure Vercel.
- Configure production environment.
- Configure domains.
- Run final testing.

### Deliverables

- Live application.
- Production database.
- Working PWA.

---

# FINAL REQUIREMENTS

The generated application must:

- Be mobile-first.
- Follow clean architecture.
- Use TypeScript everywhere.
- Use Supabase for backend.
- Use Shadcn UI.
- Use TailwindCSS.
- Be fully responsive.
- Be optimized for teachers with minimal technical knowledge.
- Support up to 500 students.
- Work as a Progressive Web App.

---

# DEFINITION OF DONE

The project is considered complete when:

1. Teachers can create daily activities.
2. Teachers can upload photos.
3. Parents can view their child's timeline.
4. Reports can be exported to PDF.
5. Authentication works.
6. Role permissions work.
7. Application is deployed to Vercel.
8. Application works properly on mobile devices.
9. All MVP requirements are completed.
10. TK Dharma Wanita Kepung 2 can use the application in production.