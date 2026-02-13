# Ampersand Aftercare - Application README

## 📋 Overview

**Ampersand Aftercare** is a comprehensive React-based web application designed to manage motorcycle service operations, including task management, inventory tracking, technician performance monitoring, and invoice generation. Built with modern technologies like Redux Toolkit, Material-UI, and WebSocket support for real-time updates.

**Application Name:** Aftercare  
**Organization:** Ampersand E-mobility  
**Technology Stack:** React 19, Redux Toolkit, Material-UI 7, WebSocket (STOMP/SockJS)

---

## 🎯 Core Features

### 1. **Authentication & Authorization** 
**Location:** `src/features/auth`

- **Sign In/Sign Up**: Email and password-based authentication with JWT tokens
- **Google OAuth Integration**: `useGoogleAuth.js` for seamless Google login
- **Email Verification**: `VerifyEmailPage.jsx` for account activation
- **Password Management**: 
  - Password reset via `ResetPasswordPage.jsx`
  - Change password dialog in `ChangePasswordDialog.jsx`
- **Role-Based Access Control (RBAC)**:
  - Roles: `ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_MANAGER`, `ROLE_TECHNICIAN`, `ROLE_STAFF`
  - Role validation via `useAuth.js` hook with methods:
    - `hasRole()` - Check single role
    - `hasAnyRole()` - Check multiple roles (OR logic)
    - `hasAllRoles()` - Verify all roles present (AND logic)

---

### 2. **Dashboard & Analytics**
**Location:** `src/features/dashboard`

- **Real-Time Dashboard** (`DashboardPage.jsx`):
  - **KPI Cards** (`KPICards.jsx`): Active cases, online technicians, pending tasks
  - **Charts** (`Charts.jsx`):
    - Service timeline (line chart)
    - Task status distribution (pie chart)
    - Active tasks timeline (bar chart)
  - **Activity Feed** (`ActivityFeed.jsx`): Recent system actions with timestamps
  - **Quick Actions** (`QuickActions.jsx`): Shortcuts to common operations

- **WebSocket Integration** (`useWebSocket.js`):
  - Real-time updates using STOMP/SockJS protocol
  - Auto-reconnection with exponential backoff
  - Live activity stream

- **Data Fetching** (thunks in `dashboardSlice.js`):
  - `fetchDashboardStats`: Overall metrics
  - `fetchServiceTimeline`: Historical timeline data
  - `fetchRecentActivity`: User activity logs (paginated, 15 items per page)
  - `fetchOverdueTasks`: Tasks past due date

---

### 3. **Monitoring & Case Management**
**Location:** `src/features/monitoring`

- **Case/Service Request Tracking** (`MonitoringPage.jsx`):
  - **Dual View Modes**:
    - Table View (`CasesTableView.jsx`): Sortable, paginated case table
    - Card View (`CasesCardView.jsx`): Visual card layout
  - **Statistics Cards** (`StatsCards.jsx`):
    - Total, pending, in-progress, completed, and overdue cases
    - Average completion time
  - **Status Progression**: PENDING → IN_PROGRESS → COMPLETED

- **Case Filtering** (`FilterPanel.jsx`):
  - By status, priority (HIGH/MEDIUM/LOW), technician, date range
  - Search by case ID or motorcycle details
  - Export to CSV

- **Case Details** (`CaseDetailsDialog.jsx`):
  - Motorcycle information and service history
  - Parts used with costs
  - Activity history and progress tracking
  - Real-time progress bar

- **Technician Reassignment** (`ReassignDialog.jsx`):
  - Reassign cases to different technicians
  - Only available for non-completed cases

- **Alert Management** (`AlertsSection.jsx`):
  - Severity levels: ERROR, WARNING, INFO
  - Displays top 5 alerts
  - Click to view related case

---

### 4. **Invoice Generation & Management**
**Location:** `src/features/monitoring/components/InvoicePreviewDialog.jsx`

- **Dual Invoice Workflow**:
  - **View Existing Invoices**: Fetch and display previously generated invoices
  - **Generate New Invoices**: Create invoices with custom details

- **Invoice Components**:
  - **Labor Section**: Hours worked × hourly rate (RWF)
  - **Parts Section**: 
    - Select from inventory with auto-fetch
    - Quantity and unit cost input
    - Dynamic total calculation
  - **Calculations**:
    - Subtotal = Labor Cost + Parts Cost
    - Discount support (fixed amount or percentage)
    - Final Total Due
  - **Additional Fields**: Notes, invoice notes

- **Invoice Preview & Export** (`invoiceHTMLGenerator.jsx`):
  - Professional HTML-to-PDF conversion
  - Print functionality
  - Includes: Invoice #, dates, motorcycle details, technician info, itemized parts
  - Color-coded styling with company branding (Ampersand E-mobility)

- **Invoice HTML Format**:
  - A4 page size optimized for printing
  - Receipt-style layout with company header
  - Summary section with yellow accent (brand color #FDDE11)
  - Footer with thank you message and generation timestamp

---

### 5. **Inventory Management**
**Location:** `src/features/inventory`

- **Inventory Tracking** (`InventoryPage.jsx`):
  - Part database with name, description, cost, and stock level
  - Real-time stock status: In Stock / Low Stock / Out of Stock
  - Threshold-based alerts

- **Part Management**:
  - **Add Parts** (`AddPartDialog.jsx`): Create new inventory items
  - **Update Stock** (`UpdateStockDialog.jsx`): Adjust quantities
  - **Delete Parts**: Remove obsolete items

- **Inventory Table** (`InventoryTable.jsx`):
  - Sortable columns: Part ID, name, description, available quantity, cost
  - Inline actions: Edit, view usage history, delete
  - Pagination support (10, 20, 50, 100 items per page)
  - Export to CSV report

- **Usage Tracking** (`UsageHistoryDialog.jsx`):
  - Track part usage per task
  - View usage date, quantity, and notes
  - Export usage history to CSV
  - Filter and search capabilities

- **Stock Alerts** (`StockAlerts.jsx`):
  - Monitor low stock conditions
  - Recommended reorder points
  - Visual alerts with color coding

- **Most Used Parts** (`MostUsedParts.jsx`):
  - Display top 8 frequently used parts
  - Quick reference for common replacements

- **Filters** (`InventoryFilters.jsx`):
  - Search by part name or ID
  - Filter by stock status
  - Date range filtering

---

### 6. **Task & Assignment Management**
**Location:** `src/features/tasks`

- **Task Assignment** (`TaskAssignmentPage.jsx`):
  - Create, edit, and reassign tasks
  - Assign tasks to specific technicians and motorcycles

- **Multiple Task Views**:
  - **Queue View** (`TaskQueue.jsx`): Traditional list with sortable columns
  - **Kanban Board** (`TaskKanbanBoard.jsx`): Drag-and-drop columns (PENDING → IN_PROGRESS → COMPLETED)
  - **Gantt Chart** (`TaskGanttView.jsx`): Timeline visualization with zoom (day/week view)

- **Task Details**:
  - Motorcycle assignment
  - Technician assignment
  - Issue type and description
  - Estimated time and due date/time
  - Priority levels: HIGH / MEDIUM / LOW
  - Labor hours estimation
  - Status tracking

- **Task Filtering** (`TaskFiltersPanel.jsx`):
  - By status, priority, technician, motorcycle
  - Date range filtering
  - Quick create button

- **Task Form** (`TaskFormDialog.jsx`):
  - Create mode: Generate new tasks
  - Edit mode: Modify existing task details
  - Form validation and error handling

- **Task Actions**:
  - Edit: Modify task parameters
  - Reassign: Change technician assignment
  - Delete: Remove tasks
  - Completion: Mark as done with labor hours tracking

---

### 7. **Technician Management & Performance**
**Location:** `src/features/technicians`

- **Technician Directory** (`TechniciansPage.jsx`):
  - List all technicians with status (online/offline)
  - Search and filter capabilities

- **Technician Table** (`TechnicianTable.jsx`):
  - Columns: Name, ID, email, phone, status, active tasks, completed tasks
  - Performance metrics: Efficiency score, on-time rate
  - Sortable and paginated
  - Export technician report to CSV

- **Performance Leaderboard** (`TechnicianLeaderboard.jsx`):
  - Top 3 performers displayed prominently
  - Composite scoring system:
    - Task completion count
    - Average completion time
    - On-time completion rate
    - Efficiency metrics
  - Star rating (0-5 scale)
  - Performance score (0-100)

- **Technician Details** (`TechnicianDetailsDialog.jsx`):
  - **Overview Tab**:
    - Online/offline status
    - Active and completed task counts
    - Average completion time
    - Efficiency and on-time metrics
    - Overdue task count
  - **Task History Tab**: List of tasks with status and duration
  - **Activity Log Tab**: Timestamp, action, and detail logs
  - **CSV Export**: Generate comprehensive technician profile report

- **Status Management**:
  - Toggle online/offline status
  - Enable/disable technician accounts
  - Role assignment (TECHNICIAN, STAFF, MANAGER)

- **Task Assignment** (`AssignTaskDialog.jsx`):
  - Assign available tasks to technicians
  - View technician workload
  - Conflict detection for already-assigned tasks

---

### 8. **Vehicle/Motorcycle Management**
**Location:** `src/features/vehicles`

- **Fleet Tracking** (`VehiclesPage.jsx`):
  - Register motorcycles with detailed information
  - Track service history per vehicle
  - Maintenance timeline

- **Vehicle Details**:
  - Unique barcode (AMPV-XXXX format)
  - Model and plate number
  - Owner information (name, phone, email)
  - Last service date
  - QR code generation for quick identification

- **Vehicle Dialog** (`VehicleDialog.jsx`):
  - Create new motorcycles
  - Edit existing vehicle details
  - Auto-generate sequential barcodes
  - Barcode preview with JsBarcode library
  - Form validation

- **Filtering & Search** (`VehicleFilters.jsx`):
  - Search by barcode, model, plate, or owner
  - Status filtering (in service, needs service)
  - Export vehicle list to CSV

- **Vehicle Statistics** (`VehicleStatistics.jsx`):
  - Total motorcycles count
  - In-service / Available / Needs Service breakdown
  - Warning/alert count
  - Visual stat cards with icons

- **Vehicle Query Methods** (via `motorcycleSlice.js`):
  - Fetch all motorcycles (paginated)
  - Search by owner phone or email
  - Filter: In service / Needing service
  - Statistics aggregation

---

### 9. **Settings & Administration**
**Location:** `src/features/settings`

- **User Management** (`UserManagementSection.jsx`):
  - **User List**: View all system users with roles and status
  - **Create User**: Add new users with default password (email sent for reset)
  - **Edit User**: Modify user details and role assignments
  - **Toggle Status**: Enable/disable user accounts
  - **Delete User**: Remove users (with protection for system accounts)
  - **Role Selection**: ADMIN, SUPERVISOR, MANAGER, TECHNICIAN, STAFF
  - **Pagination & Search**: Find users by name or email
  - **CSV Export**: Generate user report

- **Audit Logs** (`AuditLogsSection.jsx`):
  - Track all system changes
  - Filter by: Action type, user ID, date range, search query
  - Actions logged:
    - User creation, update, deletion, status changes
    - Password changes, profile updates
    - Task operations (create, update, complete)
    - Motorcycle create/update operations
  - Pagination support (10 items per page default)
  - Timestamps and performer information

- **Labor Rate Configuration** (`LaborRateSection.jsx`):
  - Set hourly labor rate (RWF/hour)
  - Track effective dates
  - Historical rate records
  - Used in invoice calculations

- **User Profile** (`ProfileSection.jsx`):
  - View own profile information
  - Edit personal details
  - Update profile picture
  - Change password

---

### 10. **Common Components & UI**
**Location:** `src/components/common`

- **Custom Button** (`CustomButton.jsx`):
  - Variants: primary (#FDDE11), secondary (#D9D9D9)
  - Support for icons and full width
  - Disabled state styling

- **Custom Text Field** (`CustomTextField.jsx`):
  - Consistent styling across the app
  - Support for validation states

- **Custom Dialog** (`CustomDialog.jsx`):
  - Standardized modal dialogs
  - Configurable actions

- **Auth Card** (`AuthCard.jsx`):
  - Centered card layout for auth pages
  - Branded styling

- **Loading Spinner** (`LoadingSpinner.jsx`):
  - Async operation feedback
  - Circular progress indicator

- **Form Header** (`FormHeader.jsx`):
  - Consistent title and subtitle layout for forms

- **Custom Link** (`CustomLink.jsx`):
  - Styled navigation links

---

### 11. **Layout & Navigation**
**Location:** `src/layouts`

- **Main Layout** (`MainLayout/`):
  - **AppBar** (`AppBar.jsx`): Company logo, application title (Aftercare), user menu
  - **Sidebar** (`Sidebar.jsx`): Navigation menu with feature access based on roles
  - **User Menu** (`UserMenu.jsx`): Profile, settings, logout options

- **Auth Layout** (`AuthLayout.jsx`):
  - Minimal layout for authentication pages
  - No navigation sidebar

- **Footer** (`Footer.jsx`):
  - Company branding (Ampersand E-mobility)
  - Links to policies and support

---

### 12. **Error Handling & Exception Pages**
**Location:** `src/components/exceptionPages`

- **Error Boundary** (`ErrorBoundary.jsx`): 
  - Catches React component errors
  - Displays error details in development mode
  - Reload and home navigation options

- **Exception Pages**:
  - **404 Not Found** (`NotFoundPage.jsx`): Resource not available
  - **401 Unauthorized** (`UnauthorizedPage.jsx`): Insufficient permissions
  - **500 Server Error** (`ServerErrorPage.jsx`): Backend failures
  - **Network Error** (`NetworkErrorPage.jsx`): Connection issues

---

### 13. **API Integration & Configuration**
**Location:** `src/config`

- **API Client** (`apiConfig.js`):
  - Axios-based HTTP client
  - JWT token management
  - Request/response interceptors
  - Error handling

- **Routes Configuration** (`routes.config.js`):
  - Route path definitions
  - Path constants for navigation

- **Navigation Configuration** (`navigation.config.js`):
  - Menu structure and ordering
  - Role-based visibility

---

### 14. **State Management**
**Location:** `src/store`

- **Redux Store** (`index.js`):
  - Slices: auth, users, settings, inventory, tasks, motorcycles, technicians, dashboard, monitoring, invoice, laborRate
  - Middleware configuration

- **Redux Slices**:
  - **authSlice**: Authentication and user identity
  - **userSlice**: User management CRUD
  - **taskAssignmentSlice**: Task operations
  - **motorcycleSlice**: Vehicle operations
  - **technicianSlice**: Technician data
  - **inventorySlice**: Inventory CRUD
  - **invoiceSlice**: Invoice generation and tracking
  - **dashboardSlice**: Dashboard metrics
  - **monitoringSlice**: Case management
  - **laborRateSlice**: Labor pricing

---

### 15. **Utilities & Helpers**
**Location:** `src/utils`

- **Date Utilities** (`dateUtils.js`):
  - Date formatting and parsing
  - Timezone handling
  - Relative time calculations

- **Image Helpers** (`imageHelpers.js`):
  - Photo URL adjustment (Google profile pictures)
  - Image optimization

- **Validators** (`validators.js`):
  - Form validation rules
  - Email, phone, password checks

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 19.1.0 |
| **State Management** | Redux Toolkit 2.8.2 |
| **UI Library** | Material-UI 7.2.0 |
| **Routing** | React Router DOM 7.7.0 |
| **Charts/Visualization** | Recharts 3.2.1, MUI X-Charts |
| **Data Grid** | MUI X-Data-Grid 8.18.0 |
| **Date Handling** | date-fns 4.1.0, Day.js 1.11.13 |
| **HTTP Client** | Axios 1.11.0 |
| **Real-Time Communication** | STOMP/SockJS, @stomp/stompjs 7.2.1 |
| **Document Generation** | jsPDF 3.0.3, html2canvas 1.4.1 |
| **Barcode Generation** | JsBarcode 3.12.1 |
| **CSV Parsing** | PapaParse 5.5.3 |
| **Authentication** | JWT-decode 4.0.0, Google OAuth 0.12.2 |
| **Build Tool** | Create React App (react-scripts 5.0.1) |
| **Icons** | Material-UI Icons 7.2.0 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aftercare-web

# Install dependencies
npm install

# Set up environment variables
# Create .env file with API endpoints