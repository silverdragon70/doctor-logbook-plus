# Medora — Complete UI & Backend Integration Documentation

---

## 1. Application Overview

### Purpose
Medora is a personal medical logbook mobile application designed for physicians. It enables doctors to document patients, clinical cases, procedures, lectures, courses, and clinical pearls in a privacy-first, offline-first architecture.

### Target Users
Physicians (all specialties, with particular focus on clinical documentation workflows).

### Platform
- Current prototype: React + Vite (web, mobile-responsive at 430px)
- Target production: React Native (iOS / Android)

### Key Capabilities
- Document patients and clinical cases with full medical records
- Track procedures (performed, assisted, observed)
- Log lectures and courses with certificate attachments
- Record investigations, medications, vitals, and progress notes
- Generate AI-powered insights and summaries (CasePearl, GroupPearl)
- Export data in PDF, Excel, Word, CSV, JSON formats
- Backup and restore data (.medora files)
- Optional Google Drive cloud sync
- Dark mode support
- Work completely offline with optional cloud backup

### Architecture

```
Mobile UI (React / React Native)
  → Local SQLite Database (primary source of truth)
  → Sync Queue (for cloud interactions)
  → Optional Google Drive Backup
  → AI Services (de-identified data only)
```

### Privacy-First Design
- All data stored locally on device by default
- Patient data de-identified before any AI processing
- No data transmitted without explicit user action
- AES-256 encryption for backups and sensitive data
- PIN lock and biometric authentication options

---

## 2. Navigation Map

### A) ASCII Navigation Tree

```
Home (CasesScreen — "/" )
├── Patient List Tab
├── Insights Tab (AI Analysis)
├── Stats Tab (Charts)
├── Hospital Overview Card → Hospital Detail (/hospital/:id)
│   ├── Edit Hospital Sheet
│   ├── Filter Sheets
│   └── Delete Hospital Dialog
└── + Add New Hospital → AddHospitalScreen (/hospital/new)

Patients (/AllPatientList)
├── Patient List (with filters)
└── Patient Profile (/patient/:id)
    ├── Edit Patient (/patient/:id/edit)
    ├── Case History → Case Detail
    └── + Add Case (FAB) → New Case

Logbook (/logbook)
├── Procedures (/procedures)
│   ├── Add/Edit Procedure Form
│   ├── Delete Procedure Dialog
│   └── Export Sheet
├── Lectures (/lectures)
│   ├── Add/Edit Lecture Form
│   ├── Delete Lecture Dialog
│   └── Export Sheet
├── Courses (/courses)
│   ├── Add/Edit Course Form
│   ├── Delete Course Dialog
│   └── Export Sheet
└── Clinical Pearls / GroupPearl (/group-pearl)
    └── AI Generation Results

Search (/search)
├── Quick Search (Diagnosis)
└── Full-Text Search

Case Detail (/case/:id)
├── Patient Info Section
├── Classification Section
├── History Section
├── Investigations Section
│   ├── Add Investigation Sheet
│   └── Edit Investigation Sheet
├── Management Section
│   ├── Add Management Sheet
│   └── Edit Management Sheet
├── Progress Notes Section
│   ├── Add Progress Note Sheet
│   └── Edit Progress Note Sheet
├── Media Section → Media Gallery (/case/:id/media)
├── Export Sheet
├── Discharge Dialog
├── Delete Case Dialog
└── CasePearl (navigation to /case/:id/pearl)

New Case (/case/new)
├── Patient Info (New/Existing toggle)
├── Classification
├── History
├── Investigations
├── Management (Medications, Respiratory, Feeding)
└── Progress Note + Vitals

Settings (/settings)
├── App Appearance
│   ├── Theme Color Sheet
│   ├── Dark Mode Toggle
│   ├── Font Size Sheet
│   └── Date Format Sheet
├── Hospital Management
│   ├── Manage Hospitals Sheet (Add/Edit/Delete)
│   └── Default Hospital Sheet
├── AI Integration
│   ├── AI Provider Sheet
│   ├── API Key Sheet
│   ├── AI Model Sheet
│   ├── AI Language Sheet
│   └── AI Features Toggle
├── Google Drive Sync
│   ├── Sync Toggle
│   ├── Sync Frequency Sheet
│   ├── Encrypted Backup Toggle
│   ├── Google Account Sheet
│   └── Sync Progress Sheet
├── Storage & Exporting
│   ├── Storage Usage Display
│   ├── Image Handling Sheet
│   ├── Create Backup Sheet → Progress Sheet
│   ├── Restore Backup Sheet → Progress Sheet
│   └── Export Data Sheet → Progress Sheet
├── Behavior
│   ├── Confirmation Dialogs Toggle
│   └── Auto-Save Toggle
├── Delete Data
│   ├── Delete Cloud Data Dialog
│   └── Clear Local Data Dialog
└── About Sheet (Legal/Disclaimers)
```

### B) Navigation Table

| From Screen | Trigger | To Screen | Navigation Type |
|---|---|---|---|
| Any (Global Header) | Settings icon tap | Settings Screen | Stack push |
| Any (Global Header) | Dark mode toggle | N/A (in-place toggle) | State change |
| Any (Bottom Nav) | Home tab tap | CasesScreen | Tab switch |
| Any (Bottom Nav) | Patients tab tap | PatientsScreen | Tab switch |
| Any (Bottom Nav) | Logbook tab tap | LogbookScreen | Tab switch |
| Any (Bottom Nav) | Search tab tap | SearchScreen | Tab switch |
| Any (FAB) | + button tap | NewCaseScreen | Stack push (no AppShell) |
| CasesScreen | Hospital card tap | HospitalPatientsScreen | Stack push |
| CasesScreen | "+ Add New Hospital" tap | AddHospitalScreen | Stack push (no AppShell) |
| CasesScreen | Patient card tap | PatientDetailScreen | Stack push |
| PatientsScreen | Patient card tap | PatientDetailScreen | Stack push |
| PatientsScreen | "+ Add New" tap | NewCaseScreen | Stack push |
| PatientDetailScreen | Edit button tap | EditPatientScreen | Stack push (no AppShell) |
| PatientDetailScreen | Case card tap | CaseDetailScreen | Stack push |
| PatientDetailScreen | FAB tap | NewCaseScreen | Stack push |
| CaseDetailScreen | Media "View All" tap | MediaGalleryScreen | Stack push (no AppShell) |
| CaseDetailScreen | Export icon tap | ExportSheet | Bottom sheet |
| CaseDetailScreen | CasePearl icon tap | CasePearl route | Stack push |
| CaseDetailScreen | Discharge icon tap | Discharge Dialog | Modal overlay |
| CaseDetailScreen | Delete icon tap | Delete Dialog | AlertDialog |
| CaseDetailScreen | + on Investigations | AddInvestigationSheet | Bottom sheet |
| CaseDetailScreen | + on Management | AddManagementSheet | Bottom sheet |
| CaseDetailScreen | + on Progress | AddProgressNoteSheet | Bottom sheet |
| LogbookScreen | Procedures card tap | ProceduresScreen | Stack push |
| LogbookScreen | Lectures card tap | LecturesScreen | Stack push |
| LogbookScreen | Courses card tap | CoursesScreen | Stack push |
| LogbookScreen | Clinical Pearls tap | GroupPearlScreen | Stack push |
| SearchScreen | Result card tap | CaseDetailScreen | Stack push |
| Settings | Theme Color row tap | ThemeColorSheet | Bottom sheet (Drawer) |
| Settings | Font Size row tap | FontSizeSheet | Bottom sheet |
| Settings | Date Format row tap | DateFormatSheet | Bottom sheet |
| Settings | Manage Hospitals tap | ManageHospitalsSheet | Bottom sheet |
| Settings | Default Hospital tap | DefaultHospitalSheet | Bottom sheet |
| Settings | AI Provider tap | AIProviderSheet | Bottom sheet |
| Settings | API Key tap | APIKeySheet | Bottom sheet |
| Settings | AI Model tap | AIModelSheet | Bottom sheet |
| Settings | AI Language tap | AILanguageSheet | Bottom sheet |
| Settings | Sync Frequency tap | SyncFrequencySheet | Bottom sheet |
| Settings | Change Google Account tap | GoogleAccountSheet | Bottom sheet |
| Settings | "Sync Now" tap | SyncProgressSheet | Bottom sheet |
| Settings | "Backup Now" tap | CreateBackupSheet | Bottom sheet |
| Settings | Restore from Backup tap | RestoreBackupSheet | Bottom sheet |
| Settings | Export Data tap | SettingsExportSheet | Bottom sheet |
| Settings | Image Handling tap | ImageHandlingSheet | Bottom sheet |
| Settings | About row tap | AboutSheet | Bottom sheet |
| Settings | Delete Cloud Data tap | AlertDialog | AlertDialog |
| Settings | Clear Local Data tap | AlertDialog | AlertDialog |

---

## 3. Global Components

### AppShell
- **File**: `src/components/AppShell.tsx`
- **Purpose**: Main layout wrapper for all routed screens
- **Behavior**:
  - Renders global header (logo "M" + "Medora", dark mode toggle, settings icon)
  - Renders bottom navigation bar (Home, Patients, Logbook, Search)
  - Renders floating action button (FAB) to add new case
  - Header hidden on detail pages (`/case/:id`, `/patient/:id`, `/hospital/:id`)
  - Bottom nav visible on main tabs AND detail pages (case, patient, hospital)
  - FAB hidden on logbook sub-screens (they have their own FAB)
  - Export button shown on logbook sub-screens via `window.dispatchEvent('open-export-sheet')`
  - Active tab highlighting adapts for detail page context

### Bottom Navigation
- **Tabs**: Home (`/`), Patients (`/AllPatientList`), Logbook (`/logbook`), Search (`/search`)
- **Icons**: Activity, Users, ClipboardList, Search (from lucide-react)
- **Active state**: `text-primary` + `font-bold`

### Floating Action Button (FAB)
- **Position**: Fixed, bottom-right area
- **Action**: Navigates to `/case/new`
- **Hidden on**: Detail pages, logbook sub-screens

### Toast Notifications
- **Components**: `Toaster` (shadcn), `Sonner`
- **Usage**: Available globally via providers in App.tsx

### Confirmation Dialogs (AlertDialog)
- Used for destructive actions: delete case, delete hospital, delete procedure/lecture/course, delete cloud data, clear local data, cancel sync, cancel backup

---

## 4. Component Library

### Reusable UI Components (shadcn/ui)

All located in `src/components/ui/`:

| Component | File | Purpose |
|---|---|---|
| Button | `button.tsx` | Primary action button with variants |
| Calendar | `calendar.tsx` | Date picker (react-day-picker) |
| Card | `card.tsx` | Content container |
| Drawer | `drawer.tsx` | Bottom sheet (vaul) |
| Dialog | `dialog.tsx` | Modal dialog |
| AlertDialog | `alert-dialog.tsx` | Confirmation dialog |
| Input | `input.tsx` | Text input field |
| Textarea | `textarea.tsx` | Multi-line text input |
| Select | `select.tsx` | Dropdown select (Radix) |
| Switch | `switch.tsx` | Toggle switch |
| Popover | `popover.tsx` | Floating content (used for Calendar pickers) |
| Progress | `progress.tsx` | Progress bar |
| Badge | `badge.tsx` | Status badge |
| ScrollArea | `scroll-area.tsx` | Scrollable container |
| Separator | `separator.tsx` | Visual divider |
| Tabs | `tabs.tsx` | Tab navigation |
| Tooltip | `tooltip.tsx` | Hover tooltip |

### Application-Specific Bottom Sheets

| Component | File | Props | Purpose |
|---|---|---|---|
| ThemeColorSheet | `ThemeColorSheet.tsx` | `open, onOpenChange, value, onApply` | Select theme color (blue/green/purple/teal) |
| FontSizeSheet | `FontSizeSheet.tsx` | `open, onOpenChange, value, onApply` | Select font size (small/medium/large) |
| DateFormatSheet | `DateFormatSheet.tsx` | `open, onOpenChange, value, onApply` | Select date format |
| ManageHospitalsSheet | `ManageHospitalsSheet.tsx` | `open, onOpenChange` | Add/edit/delete hospitals |
| DefaultHospitalSheet | `DefaultHospitalSheet.tsx` | `open, onOpenChange, hospitals, value, onApply` | Select default hospital |
| AIProviderSheet | `AIProviderSheet.tsx` | `open, onOpenChange, value, onApply` | Select AI provider |
| APIKeySheet | `APIKeySheet.tsx` | `open, onOpenChange, value, onSave, onRemove` | Enter/view/remove API key |
| AIModelSheet | `AIModelSheet.tsx` | `open, onOpenChange, value, onApply` | Select AI model |
| AILanguageSheet | `AILanguageSheet.tsx` | `open, onOpenChange, value, onApply` | Select AI response language |
| SyncFrequencySheet | `SyncFrequencySheet.tsx` | `open, onOpenChange, value, onApply` | Select sync frequency |
| GoogleAccountSheet | `GoogleAccountSheet.tsx` | `open, onOpenChange, accounts, onConnect, onSetActive, onDisconnectOne, onDisconnectAll` | Manage Google accounts |
| SyncProgressSheet | `SyncProgressSheet.tsx` | `open, onOpenChange, email, onComplete` | Animated sync progress |
| ProgressSheet | `ProgressSheet.tsx` | `open, onOpenChange, type, detail, onComplete, onRetry` | Generic progress (backup/export/restore) |
| CreateBackupSheet | `CreateBackupSheet.tsx` | `open, onOpenChange, defaultLocation, onBackupComplete` | Configure and start backup |
| RestoreBackupSheet | `RestoreBackupSheet.tsx` | `open, onOpenChange, onRestore` | File selection + restore confirmation |
| ExportSheet | `ExportSheet.tsx` | `open, onOpenChange, title, data, columns, dateKey, cases?` | Filter and export data |
| SettingsExportSheet | `SettingsExportSheet.tsx` | `open, onOpenChange, gdriveConnected?, onExportStart?` | Full export from Settings |
| ImageHandlingSheet | `ImageHandlingSheet.tsx` | `open, onOpenChange, onApply` | Image quality/size settings |
| AboutSheet | `AboutSheet.tsx` | `open, onOpenChange` | Legal disclaimers and app info |

### Case Detail Bottom Sheets

| Component | File | Props | Purpose |
|---|---|---|---|
| AddInvestigationSheet | `case-detail/AddInvestigationSheet.tsx` | `open, onClose, onSave, initialData?` | Add/edit investigation |
| AddManagementSheet | `case-detail/AddManagementSheet.tsx` | `open, onClose, onSave, initialData?` | Add/edit management entry |
| AddProgressNoteSheet | `case-detail/AddProgressNoteSheet.tsx` | `open, onClose, onSave, initialData?` | Add/edit progress note |

---

## 5. Screen-by-Screen Documentation

### 5.1 CasesScreen (Home)
- **File**: `src/pages/CasesScreen.tsx`
- **Route**: `/`
- **Screen type**: Main Tab
- **Header**: Global header (via AppShell)
- **Bottom nav**: Yes (Home active)

#### UI Elements

**Search Bar**
- Component: text input with Search icon
- Placeholder: "Search patient or department..."
- Data Operation: Client-side filter on `mockCases`

**"+ Add New Hospital" Button**
- Interaction: Navigates to `/hospital/new`

**Hospital Overview Card**
- Displays: Hospital name, department, unit
- Stats: TOTAL, ACTIVE, DISCH (3-column grid)
- Interaction: Navigates to `/hospital/1`
- API Contract: `GET /hospitals/:id` → hospital details + patient counts

**Segmented Tabs** (Patient List | Stats | Insights)

**Patient List Tab**
- Displays recent cases as cards
- Each card: avatar (initials), patient name, gender icon, room, time ago, department badge
- Interaction: Card tap navigates to `/patient/:caseId`
- API Contract: `GET /cases?sort=lastModified&limit=N` → case list

**Stats Tab** (StatsTab component)
- Time filters: All, This Month, 3M, 6M, Year
- Charts: Admissions per Month (ComposedChart), Top Diagnoses (BarChart)
- Procedure stats: Total, Performed, Assisted, Observed
- API Contract: `GET /stats?period=X` → aggregated statistics

**Insights Tab**
- States: ready → loading → done
- Ready: "Start Analysis" button with pulsing stethoscope icon
- Loading: Spinning icon with progress dots
- Done: Results grouped by status (red: Needs Attention, yellow: Review Plan, green: Ready for Discharge)
- Each result: patient name, summary, recommendation
- API Contract: `POST /ai/insights` → `{ groups: [{ status, label, cases: [{ name, summary, recommendation }] }] }`

### 5.2 PatientsScreen
- **File**: `src/pages/PatientsScreen.tsx`
- **Route**: `/AllPatientList`
- **Screen type**: Main Tab
- **Header**: Global header
- **Bottom nav**: Yes (Patients active)

#### UI Elements

**Search Bar**
- Placeholder: "Search patients..."
- Client-side filter on patient name

**Filter Chips** (FilterChip component)
- Categories: Date Added, Age Group, Specialty
- Each opens dropdown with options
- "Clear All" button when filters active

**Patient Count**: `{N} Patients`

**"+ Add New" Button**: Navigates to `/case/new`

**Patient List**
- Card: avatar (initials, gradient), name, age, gender, case count, status badge (Active/Discharged)
- Interaction: Tap navigates to `/patient/:patientId`
- Empty state: "No patients match the filters"
- API Contract: `GET /patients?search=X&dateAdded=X&ageGroup=X&specialty=X`

**Patient Data Fields**:
```typescript
{
  patientId: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  caseCount: number;
  lastVisit: string;      // 'YYYY-MM-DD'
  specialty: string;
  dateAdded: string;       // 'YYYY-MM-DD'
  status: 'active' | 'discharged';
}
```

### 5.3 PatientDetailScreen
- **File**: `src/pages/PatientDetailScreen.tsx`
- **Route**: `/patient/:id`
- **Screen type**: Sub-screen (detail page)
- **Header**: Sub-header (back, "Patient Profile", edit)
- **Bottom nav**: Yes (Patients active)

#### UI Elements

**Patient Card**
- Avatar (large), name, age, gender
- Stats: CASES count, IMAGES count, LAST VISIT date
- API Contract: `GET /patients/:id`

**Case History List**
- Each card: FileText icon, diagnosis (bold), complaint + date, outcome badge
- Outcome badges: Cured, Follow Up, Referred, Transferred, LAMA, Chronic, Home Care, Died, Hospitalized (active)
- Interaction: Tap navigates to `/case/:caseId`
- API Contract: `GET /patients/:id/cases`

**FAB**: Navigate to `/case/new` (with patient pre-fill intent)

### 5.4 CaseDetailScreen
- **File**: `src/pages/CaseDetailScreen.tsx`
- **Route**: `/case/:id`
- **Screen type**: Sub-screen (detail page)
- **Header**: Sub-header with actions (back, "Case Details", export, CasePearl, discharge, delete)
- **Bottom nav**: Yes (Patients active)

#### Quick Navigation Bar
- Pills: Info, Class, History, Inv, Management, Progress
- Sticky below header, scrolls with content (IntersectionObserver)

#### Sections (AccordionSection — all collapsed by default)

**1. Patient Information**
- Fields: Full Name, DOB (DD/MM/YYYY), Gender pill, File Number, Hospital, Admission Date
- Edit mode toggle (pencil icon)
- API Contract: `GET /cases/:id` → patient info fields

**2. Classification**
- Fields: Specialty, Provisional Diagnosis, Chief Complaint
- Edit mode toggle
- API Contract: part of `GET /cases/:id`

**3. Patient History**
- Fields: Chief Complaint, Present History, Past Medical History, Allergies, Current Medications
- Edit mode toggle
- API Contract: part of `GET /cases/:id`

**4. Investigations**
- Cards per investigation, each expandable
- Card header: name, type badge (Lab/Imaging/Other), date
- Expanded: result text, attached image thumbnails (max 3 + "+N" overflow)
- Actions (when expanded): Edit (pencil), Delete (trash)
- Add button (+) opens AddInvestigationSheet
- API Contract: `GET /cases/:id/investigations`, `POST /cases/:id/investigations`, `PUT /investigations/:id`, `DELETE /investigations/:id`

**Investigation Fields**:
```typescript
{
  id: string;
  name: string;
  type: 'Lab Result' | 'Imaging' | 'Other';
  date: string;
  result: string;
  images: string[];
}
```

**5. Management**
- Cards per entry, each expandable
- Types: Medications (💊), Respiratory Support (🫁), Feeding (🍼)
- Medications card: numbered medications list
- Respiratory/Feeding: mode pill + details text
- Actions when expanded: Edit, Delete
- Add button (+) opens AddManagementSheet
- API Contract: `GET /cases/:id/management`, `POST /cases/:id/management`, `PUT /management/:id`, `DELETE /management/:id`

**Management Fields**:
```typescript
// Medications
{ id: string; type: 'Medications'; date: string; medications: string[]; chartImage: string; }

// Respiratory Support
{ id: string; type: 'Respiratory Support'; date: string; mode: string; details: string; }

// Feeding
{ id: string; type: 'Feeding'; date: string; mode: string; details: string; }
```

**6. Progress Notes**
- Cards per note, each expandable
- Card: date, assessment text
- Nested sub-accordion: Vital Signs
- Vitals: HR, SPO₂, Temp, RR, BP, Weight, Date & Time
- Actions when expanded: Edit, Delete
- Add button (+) opens AddProgressNoteSheet
- API Contract: `GET /cases/:id/progress-notes`, `POST /cases/:id/progress-notes`, `PUT /progress-notes/:id`, `DELETE /progress-notes/:id`

**Progress Note Fields**:
```typescript
{
  id: string;
  date: string;
  assessment: string;
  vitals: {
    hr: string;
    spo2: string;
    temp: string;
    rr: string;
    bp: string;
    weight: string;
    dateTime: string;
  };
}
```

**Media Section**
- Shows image count and thumbnail grid
- "View All" navigates to `/case/:id/media`
- "ADD" button for new media
- API Contract: `GET /cases/:id/media`

**Discharge Dialog** (modal overlay)
- Fields: Discharge Date (calendar picker), Outcome (dropdown), Discharge Notes (textarea)
- Outcomes: Cured/Recovered, Follow Up Required, Referred to Specialist, Transferred, LAMA, Chronic, Home Care, Died
- Buttons: Cancel, Discharge (disabled until date + outcome selected)
- API Contract: `PUT /cases/:id/discharge` → `{ date, outcome, notes }`

**Delete Case Dialog** (AlertDialog)
- API Contract: `DELETE /cases/:id`

**Delete Card Dialog** (custom overlay)
- For deleting individual investigation/management/progress note cards

### 5.5 NewCaseScreen
- **File**: `src/pages/NewCaseScreen.tsx`
- **Route**: `/case/new`
- **Screen type**: Standalone (no AppShell)
- **Header**: Sub-header (back, "New Case", Save button)

#### Quick Navigation Bar
- Pills: Info, Class, History, Inv, Management, Progress
- Sticky, IntersectionObserver-based active state

#### Sections (CollapsibleSection)

**Patient Information** (expanded by default)
- Toggle: New Patient / Existing Patient
- New Patient: Full Name*, DOB* (DD/MM/YYYY), Gender* (male/female pills), File Number, Hospital* (Select), Admission Date* (Calendar)
- Existing Patient: Search bar → dropdown list → selected patient card with clear button
- API Contract: `POST /patients` (new) or reference existing patient ID

**Classification**
- Specialty* (Select dropdown with 10 options)
- Provisional Diagnosis (textarea)
- Final Diagnosis (textarea)

**Patient History**
- Chief Complaint (textarea)
- Present History (textarea)
- Past Medical History (textarea)
- Allergies (text input)
- Current Medications (textarea)

**Investigations**
- Investigation Name (text input)
- Type (Select: Lab Result, Imaging, Other)
- Date (Calendar picker)
- Result (textarea)
- Attach image button (dashed border upload area)

**Management** (nested sub-sections)
- Medications: textarea for listing medications
- Respiratory Support: Type grid (Room Air, Nasal O₂, Mask, HFNC, CPAP, MV) + Details textarea
- Feeding: textarea for feeding details

**Progress Note**
- Date (Calendar picker)
- Assessment (textarea)
- Vital Signs sub-section: HR, SPO₂, Temp, RR, BP, Weight (text inputs), Date & Time (text input)

**Save Action**
- API Contract: `POST /cases` with all collected fields
- Required fields: Patient Name, DOB, Gender, Hospital, Admission Date, Specialty

### 5.6 LogbookScreen
- **File**: `src/pages/LogbookScreen.tsx`
- **Route**: `/logbook`
- **Screen type**: Main Tab
- **Header**: Global header
- **Bottom nav**: Yes (Logbook active)

#### UI Elements
- Three category cards: Procedures, Lectures, Courses
- Each shows icon, title, 2 stat values, chevron
- Card tap navigates to respective route
- Separate "Clinical Pearls" card navigating to `/group-pearl`

### 5.7 ProceduresScreen
- **File**: `src/pages/ProceduresScreen.tsx`
- **Route**: `/procedures`
- **Screen type**: Logbook sub-screen
- **Header**: Global header (with export button via event)
- **Bottom nav**: Yes (Logbook active)

#### UI Elements

**Stats Row** (3 cards)
- Performed (green), Assisted (yellow), Observed (blue) — counts

**Filter Pills**: All, Performed, Assisted, Observed

**Procedure List**
- Card: name, date, participation badge, patient, hospital, supervisor, indication, notes
- Actions: Edit (opens form), Delete (opens AlertDialog)
- Empty state: "No procedures logged yet"

**Add/Edit Form** (full screen replacement)
- Procedure Name: ProcedureSearchDropdown (grouped: Core, Advanced, Daily Practice + custom "Add" option)
- Date: Calendar picker
- Participation Type: 3-way toggle (Performed/Assisted/Observed)
- Patient: PatientSearchDropdown (optional)
- Hospital: HospitalSearchDropdown (optional)
- Supervisor (optional)
- Indication
- Notes (optional)
- Save button (disabled if no name)

**Procedure Fields**:
```typescript
interface Procedure {
  id: string;
  name: string;
  date: string;           // 'YYYY-MM-DD'
  participation: 'Performed' | 'Assisted' | 'Observed';
  patientName?: string;
  hospital?: string;
  supervisor?: string;
  location?: string;
  indication?: string;
  notes?: string;
}
```

**API Contract**:
- `GET /procedures?participation=X` → procedure list
- `POST /procedures` → create procedure
- `PUT /procedures/:id` → update procedure
- `DELETE /procedures/:id` → delete procedure

### 5.8 LecturesScreen
- **File**: `src/pages/LecturesScreen.tsx`
- **Route**: `/lectures`
- **Screen type**: Logbook sub-screen

**Lecture Fields**:
```typescript
interface Lecture {
  id: string;
  topic: string;
  date: string;           // 'YYYY-MM-DD'
  speaker?: string;
  duration?: string;
  location?: string;
  notes?: string;
}
```

**API Contract**:
- `GET /lectures` → lecture list
- `POST /lectures` → create lecture
- `PUT /lectures/:id` → update lecture
- `DELETE /lectures/:id` → delete lecture

### 5.9 CoursesScreen
- **File**: `src/pages/CoursesScreen.tsx`
- **Route**: `/courses`
- **Screen type**: Logbook sub-screen

**Course Fields**:
```typescript
interface Course {
  id: string;
  name: string;
  date: string;           // 'YYYY-MM-DD'
  provider?: string;
  duration?: string;
  hasCertificate: boolean;
  certificateName?: string;
  notes?: string;
}
```

Features certificate upload (JPEG, PNG, PDF) via file input.

**API Contract**:
- `GET /courses` → course list
- `POST /courses` → create course (multipart for certificate)
- `PUT /courses/:id` → update course
- `DELETE /courses/:id` → delete course

### 5.10 GroupPearlScreen
- **File**: `src/pages/GroupPearlScreen.tsx`
- **Route**: `/group-pearl`
- **Screen type**: Logbook sub-screen

#### UI Elements

**Filter Card**
- Diagnosis input (text)
- Time Period pills: Last Week, Last Month, Last 3 Months, Last 6 Months, Last Year, All Time, Custom
- Custom: From/To date pickers
- Outcome pills: All, Active, Improved, Died
- "Generate GroupPearl" button with validation

**Screen States**: empty → loading → results / error / no_cases

**Results Display**:
- Summary card
- Patterns card (bulleted list)
- Comparison section
- Clinical Pearls
- Disease Review

**API Contract**:
- `POST /ai/group-pearl` → `{ diagnosis, timePeriod, outcome, fromDate?, toDate? }`
- Response: `{ summary, patterns[], comparison, pearl, diseaseReview }`
### 5.10b CasePearlScreen
- **File**: `src/pages/CasePearlScreen.tsx`
- **Route**: `/case/:id/pearl`
- **Screen type**: Standalone (no AppShell)
- **Header**: Sub-header with back arrow ← and title "Case Pearl"
- **Bottom nav**: No

**Navigation entry**: CaseDetailScreen → tap lightbulb icon (💡)
**Data passed**: Full case object (de-identified) via route state

#### UI Elements

**Loading State**
- Spinner animation while AI processes
- Text: "Analyzing case..."

**Error State**
- Error message card
- "Try Again" button
- Retry triggers re-send to AI provider

**Results State**
- Clinical Summary card
- Key Findings card (bulleted list)
- Recommendations card
- Disease Review card (if applicable)
- Language: controlled by aiLanguage setting

**API Contract**:
- `POST /ai/case-pearl`
- Request: `{ caseId, caseData: DeIdentifiedCase }`
- Response: `{ summary, keyFindings: string[], recommendations: string[], diseaseReview?: string }`

### 5.11 SearchScreen
- **File**: `src/pages/SearchScreen.tsx`
- **Route**: `/search`
- **Screen type**: Main Tab

#### UI Elements
- Search input with clear button
- Search type toggle: Quick (Diagnosis) | Full-Text
- Pre-search: Recent searches as pill buttons
- Post-search: Results list with filter button, result cards (name, date, diagnosis, complaint, media count)
- Result tap navigates to `/case/:caseId`

**API Contract**:
- `GET /search?q=X&type=quick|fulltext` → search results

### 5.12 HospitalPatientsScreen
- **File**: `src/pages/HospitalPatientsScreen.tsx`
- **Route**: `/hospital/:id`
- **Screen type**: Detail page

- Hospital info card, patient list with search/filters
- Filter sheets (status, age group, specialty, date range)
- Edit Hospital sheet, Delete Hospital dialog
- Patient tap navigates to `/patient/:id`

### 5.13 EditPatientScreen
- **File**: `src/pages/EditPatientScreen.tsx`
- **Route**: `/patient/:id/edit`
- **Screen type**: Standalone

- Form: Name, DOB (DD/MM/YYYY), Gender, File Number, Hospital (Select), Admission Date (Calendar)
- Save button (disabled if required fields empty)
- API Contract: `PUT /patients/:id`

### 5.14 AddHospitalScreen
- **File**: `src/pages/AddHospitalScreen.tsx`
- **Route**: `/hospital/new`
- **Screen type**: Standalone

- Form: Hospital Name*, Department*, Location, Position (Select: intern/resident/registrar/specialist), Start Working Date (Calendar)
- Save button (disabled unless name + department filled)
- API Contract: `POST /hospitals`

### 5.15 MediaGalleryScreen
- **File**: `src/pages/MediaGalleryScreen.tsx`
- **Route**: `/case/:id/media`
- **Screen type**: Standalone

- Grid of placeholder images
- "Capture" button, "Add Image" button
- Fullscreen preview modal with close and delete buttons
- API Contract: `GET /cases/:id/media`, `POST /cases/:id/media`, `DELETE /media/:id`

### 5.16 SettingsScreen
- **File**: `src/pages/SettingsScreen.tsx`
- **Route**: `/settings`
- **Screen type**: Standalone (no AppShell)

See Section 3 navigation tree for all settings sections and bottom sheets.

### 5.17 NotFound
- **File**: `src/pages/NotFound.tsx`
- **Route**: `*` (catch-all)
- Shows 404 message with "Return to Home" link

---

## 6. Data Models

### Patient
```typescript
interface Patient {
  patientId: string;       // UUID, primary key
  name: string;            // Required, English
  age: number;             // Calculated from DOB
  gender: 'male' | 'female'; // Required
  caseCount: number;       // Derived (count of cases)
  lastVisit: string;       // 'YYYY-MM-DD', derived from latest case
  specialty: string;       // From latest case
  dateAdded: string;       // 'YYYY-MM-DD', auto-generated
  status: 'active' | 'discharged'; // Derived from cases
  createdAt: string;       // ISO date
  updatedAt: string;       // ISO date
  fileNumber?: string;     // Hospital file number
  dobDay: string;          // DD
  dobMonth: string;        // MM
  dobYear: string;         // YYYY
}
```

### Case
```typescript
interface Case {
  caseId: string;          // UUID, primary key
  patientId: string;       // FK → Patient
  patientName: string;     // Denormalized for display
  patientAge: number;
  patientGender: 'male' | 'female';
  date: string;            // Admission date 'YYYY-MM-DD'
  fileNumber: string;
  hospital: string;
  dob: { day: string; month: string; year: string };
  admissionDate: string;   // Display format 'DD / MM / YYYY'
  specialty: string;
  provisionalDiagnosis: string;
  finalDiagnosis?: string;
  chiefComplaint: string;
  historyComplaint: string; // Detailed chief complaint in history section
  presentHistory: string;
  pastMedicalHistory: string;
  allergies: string;
  currentMedications: string;
  mediaCount: number;      // Derived
  lastModified: number;    // Unix timestamp
  status: 'active' | 'discharged';
  dischargeDate?: string;
  dischargeOutcome?: string;
  dischargeNotes?: string;
}
```

### Investigation
```typescript
interface Investigation {
  id: string;              // UUID, primary key
  caseId: string;          // FK → Case
  name: string;            // e.g. "CBC", "Chest X-Ray"
  type: 'Lab Result' | 'Imaging' | 'Other';
  date: string;            // 'DD/MM/YYYY'
  result: string;
  images: string[];        // Array of image file paths
}
```

### ManagementEntry
```typescript
// Medications
interface MedicationEntry {
  id: string;
  caseId: string;
  type: 'Medications';
  date: string;
  medications: string[];   // Array of medication strings
  chartImage: string;      // Optional chart image path
}

// Respiratory Support
interface RespiratoryEntry {
  id: string;
  caseId: string;
  type: 'Respiratory Support';
  date: string;
  mode: string;            // 'Room Air' | 'Nasal O₂' | 'Mask' | 'HFNC' | 'CPAP' | 'MV'
  details: string;
}

// Feeding
interface FeedingEntry {
  id: string;
  caseId: string;
  type: 'Feeding';
  date: string;
  mode: string;            // 'Oral' | 'Nasogastric' | 'TPN' | etc.
  details: string;
}

type ManagementEntry = MedicationEntry | RespiratoryEntry | FeedingEntry;
```

### ProgressNote
```typescript
interface ProgressNote {
  id: string;              // UUID, primary key
  caseId: string;          // FK → Case
  date: string;            // 'DD/MM/YYYY'
  assessment: string;
  vitals: VitalSigns;
}
```

### VitalSigns
```typescript
interface VitalSigns {
  hr: string;              // Heart Rate (BPM)
  spo2: string;            // Oxygen Saturation (%)
  temp: string;            // Temperature (°C)
  rr: string;              // Respiratory Rate (/min)
  bp: string;              // Blood Pressure (mmHg)
  weight: string;          // Weight (kg)
  dateTime: string;        // 'DD/MM/YYYY  HH:MM AM/PM'
}
```

### Procedure
```typescript
interface Procedure {
  id: string;
  name: string;
  date: string;            // 'YYYY-MM-DD'
  participation: 'Performed' | 'Assisted' | 'Observed';
  patientName?: string;
  hospital?: string;
  supervisor?: string;
  location?: string;
  indication?: string;
  notes?: string;
}
```

### Lecture
```typescript
interface Lecture {
  id: string;
  topic: string;
  date: string;            // 'YYYY-MM-DD'
  speaker?: string;
  duration?: string;
  location?: string;
  notes?: string;
}
```

### Course
```typescript
interface Course {
  id: string;
  name: string;
  date: string;            // 'YYYY-MM-DD'
  provider?: string;
  duration?: string;
  hasCertificate: boolean;
  certificateName?: string;
  notes?: string;
}
```

### Hospital
```typescript
interface Hospital {
  id: string;
  name: string;            // Required
  department?: string;
  unit?: string;
  location?: string;
  position?: string;       // 'intern' | 'resident' | 'registrar' | 'specialist'
  startDate?: string;      // 'YYYY-MM-DD'
}
```

### AppSettings
```typescript
interface AppSettings {
  themeColor: 'blue' | 'green' | 'purple' | 'teal';
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'DD MMM YYYY' | 'YYYY-MM-DD';
  defaultHospitalId: string;
  aiProvider: 'anthropic' | 'openai' | 'custom';
  apiKey: string;          // Encrypted
  aiModel: 'sonnet' | 'opus' | 'haiku';
  aiLanguage: 'arabic' | 'english';
  aiFeatures: boolean;
  syncEnabled: boolean;
  syncFrequency: 'hourly' | '6hours' | 'daily' | 'weekly' | 'manual';
  encryptedBackup: boolean;
  pinLock: boolean;
  biometric: boolean;
  confirmDialogs: boolean;
  autoSave: boolean;
  imageQuality: 'compress' | 'original';
  imageMaxSize: '1' | '5' | '10' | 'none';
}
```

### BackupMetadata
```typescript
interface BackupMetadata {
  appVersion: string;
  date: string;            // ISO date
  backupType: 'full' | 'incremental' | 'data';
  size: string;
  destination: 'local' | 'gdrive';
}
```

### GoogleAccount
```typescript
interface GoogleAccount {
  id: string;
  email: string;
  active: boolean;
}
```

---

## 7. API Contract

### Patients

#### GET /patients
| Property | Detail |
|---|---|
| Method | GET |
| Path | `/patients` |
| Purpose | List all patients with optional filters |
| Request Query | `search?: string`, `dateAdded?: 'week'|'month'|'3months'|'year'`, `ageGroup?: 'neonate'|'infant'|'toddler'|'child'|'adolescent'`, `specialty?: string` |
| Response 200 | `{ patients: Patient[] }` |
| Triggered By | PatientsScreen list |

#### GET /patients/:id
| Property | Detail |
|---|---|
| Method | GET |
| Path | `/patients/:id` |
| Purpose | Get patient detail with stats |
| Response 200 | `{ patient: Patient, stats: { cases: number, images: number, lastVisit: string } }` |
| Triggered By | PatientDetailScreen |

#### POST /patients
| Property | Detail |
|---|---|
| Method | POST |
| Path | `/patients` |
| Purpose | Create new patient |
| Request Body | `{ name, dobDay, dobMonth, dobYear, gender, fileNumber?, hospital }` |
| Response 200 | `{ patient: Patient }` |
| Triggered By | NewCaseScreen (new patient mode) |

#### PUT /patients/:id
| Property | Detail |
|---|---|
| Method | PUT |
| Path | `/patients/:id` |
| Purpose | Update patient info |
| Request Body | `{ name, dobDay, dobMonth, dobYear, gender, fileNumber?, hospital, admissionDate? }` |
| Response 200 | `{ patient: Patient }` |
| Triggered By | EditPatientScreen Save button |

### Cases

#### GET /patients/:id/cases
| Property | Detail |
|---|---|
| Method | GET |
| Path | `/patients/:id/cases` |
| Purpose | Get all cases for a patient |
| Response 200 | `{ cases: Case[] }` |
| Triggered By | PatientDetailScreen case history |

#### GET /cases/:id
| Property | Detail |
|---|---|
| Method | GET |
| Path | `/cases/:id` |
| Purpose | Get full case detail |
| Response 200 | `{ case: Case, investigations: Investigation[], management: ManagementEntry[], progressNotes: ProgressNote[] }` |
| Triggered By | CaseDetailScreen |

#### POST /cases
| Property | Detail |
|---|---|
| Method | POST |
| Path | `/cases` |
| Purpose | Create new case |
| Request Body | All case fields + patient fields if new patient |
| Response 200 | `{ case: Case }` |
| Triggered By | NewCaseScreen Save button |

#### PUT /cases/:id/discharge
| Property | Detail |
|---|---|
| Method | PUT |
| Path | `/cases/:id/discharge` |
| Purpose | Discharge patient |
| Request Body | `{ date: string, outcome: string, notes?: string }` |
| Response 200 | `{ case: Case }` |
| Triggered By | Discharge Dialog confirm |

#### DELETE /cases/:id
| Property | Detail |
|---|---|
| Method | DELETE |
| Path | `/cases/:id` |
| Purpose | Delete case and all related records |
| Response 200 | `{ success: true }` |
| Response 404 | `{ error: 'Case not found' }` |
| Cascade | Deletes investigations, management, progress_notes, vitals, media |
| Triggered By | CaseDetailScreen delete confirmation dialog |

### Investigations

#### POST /cases/:caseId/investigations
| Property | Detail |
|---|---|
| Method | POST |
| Path | `/cases/:caseId/investigations` |
| Request Body | `{ name, type, date, result }` |
| Triggered By | AddInvestigationSheet Save |

#### PUT /investigations/:id
| Property | Detail |
|---|---|
| Method | PUT |
| Path | `/investigations/:id` |
| Request Body | `{ name, type, date, result }` |
| Triggered By | Edit investigation Save |

#### DELETE /investigations/:id
| Property | Detail |
|---|---|
| Method | DELETE |
| Path | `/investigations/:id` |
| Triggered By | Delete investigation confirm |

### Management

#### POST /cases/:caseId/management
| Property | Detail |
|---|---|
| Method | POST |
| Path | `/cases/:caseId/management` |
| Request Body | `{ type, medications?, mode?, details? }` |
| Triggered By | AddManagementSheet Save |

#### PUT /management/:id
| Property | Detail |
|---|---|
| Method | PUT |
| Request Body | Same as POST |
| Triggered By | Edit management Save |

#### DELETE /management/:id
| Property | Detail |
|---|---|
| Method | DELETE |
| Triggered By | Delete management confirm |

### Progress Notes

#### POST /cases/:caseId/progress-notes
| Property | Detail |
|---|---|
| Method | POST |
| Path | `/cases/:caseId/progress-notes` |
| Request Body | `{ date, assessment, vitals: { hr, spo2, temp, rr, bp, weight } }` |
| Triggered By | AddProgressNoteSheet Save |

#### PUT /progress-notes/:id
| Property | Detail |
|---|---|
| Method | PUT |
| Request Body | Same as POST |
| Triggered By | Edit progress note Save |

#### DELETE /progress-notes/:id
| Property | Detail |
|---|---|
| Method | DELETE |
| Triggered By | Delete progress note confirm |

### Procedures

#### GET /procedures
| Property | Detail |
|---|---|
| Method | GET |
| Query | `participation?: 'Performed'|'Assisted'|'Observed'` |
| Response 200 | `{ procedures: Procedure[] }` |

#### POST /procedures
| Request Body | `{ name, date, participation, patientName?, hospital?, supervisor?, indication?, notes? }` |

#### PUT /procedures/:id
| Request Body | Same as POST |

#### DELETE /procedures/:id
| Response 200 | `{ success: true }` |


### Lectures

#### GET /lectures
| Response 200 | `{ lectures: Lecture[] }` |

#### POST /lectures
| Request Body | `{ topic, date, speaker?, duration?, location?, notes? }` |

#### PUT /lectures/:id
#### DELETE /lectures/:id
| Response 200 | `{ success: true }` |

### Courses

#### GET /courses
| Response 200 | `{ courses: Course[] }` |

#### POST /courses
| Request Body | `{ name, date, provider?, duration?, certificateFile?, notes? }` (multipart) |

#### PUT /courses/:id
#### DELETE /courses/:id
| Response 200 | `{ success: true }` |

### Hospitals

#### GET /hospitals
| Response 200 | `{ hospitals: Hospital[] }` |

#### GET /hospitals/:id
| Response 200 | `{ hospital: Hospital, patients: Patient[], stats: { total, active, discharged } }` |

#### POST /hospitals
| Request Body | `{ name, department, location?, position?, startDate? }` |

#### PUT /hospitals/:id
| Request Body | Same as POST |

#### DELETE /hospitals/:id
| Property | Detail |
|---|---|
| Method | DELETE |
| Path | `/hospitals/:id` |
| Purpose | Remove hospital from list |
| Response 200 | `{ success: true }` |
| Note | Does NOT delete patient cases. Cases retain hospital name as text. |
| Triggered By | ManageHospitalsSheet delete confirmation |

#### DELETE /media/:id
| Response 200 | `{ success: true }` |
| Side Effect | Delete image file from local storage path |

#### POST /ai/case-pearl
| Property | Detail |
|---|---|
| Method | POST |
| Path | `/ai/case-pearl` |
| Purpose | Generate clinical pearl for single case |
| Request Body | `{ caseId: string, caseData: DeIdentifiedCase }` |
| Response 200 | `{ summary: string, keyFindings: string[], recommendations: string[], diseaseReview?: string }` |
| Response 400 | `{ error: 'Missing case data' }` |
| Response 500 | `{ error: 'AI provider error', message: string }` |
| Triggered By | CasePearlScreen on mount |

### Search

#### GET /search
| Query | `q: string, type: 'quick' | 'fulltext'` |
| Response 200 | `{ results: { caseId, patientName, diagnosis, date, complaint, mediaCount }[] }` |

### AI

#### POST /ai/insights
| Request Body | `{ cases: DeIdentifiedCase[] }` |
| Response 200 | `{ groups: [{ status: 'red'|'yellow'|'green', label: string, cases: [{ name, summary, recommendation }] }] }` |
| Triggered By | CasesScreen Insights tab "Start Analysis" |

#### POST /ai/group-pearl
| Request Body | `{ diagnosis, timePeriod, outcome, fromDate?, toDate? }` |
| Response 200 | `{ summary, patterns: string[], comparison: string, pearl: string, diseaseReview: string }` |
| Triggered By | GroupPearlScreen "Generate" button |

### Export

#### POST /export
| Request Body | `{ categories: string[], hospital?, period, format: 'PDF'|'DOCX'|'Excel'|'JSON', saveLocation: 'device'|'gdrive' }` |
| Response 200 | `{ fileUrl: string }` or blob download |
| Triggered By | SettingsExportSheet Export button, ExportSheet Export button |

### Backup

#### POST /backup
| Request Body | `{ type: 'full'|'incremental'|'data', destination: 'local'|'gdrive', timePeriod?: 'all'|'custom', fromDate?, toDate? }` |
| Response 200 | `{ metadata: BackupMetadata }` |
| Triggered By | CreateBackupSheet Start Backup |

#### POST /restore
| Request Body | `{ fileUri: string, restoreType: 'full'|'data' }` |
| Response 200 | `{ success: true }` |
| Triggered By | RestoreBackupSheet Restore Now |

### Sync

#### POST /sync
| Request Body | `{ email: string }` |
| Response 200 | `{ timestamp: string }` |
| Triggered By | "Sync Now" button |

### Settings

#### GET /settings
| Response 200 | `{ settings: AppSettings }` |

#### PUT /settings
| Request Body | Partial `AppSettings` |

### Media

#### GET /cases/:caseId/media
| Response 200 | `{ media: { mediaId: string, url: string }[] }` |

#### POST /cases/:caseId/media
| Request Body | multipart form with image file |

#### DELETE /media/:id

---

## 8. Backend Architecture

### Folder Structure

```
/medora
├── /mobile                   ← React Native app (DO NOT MODIFY)
│   └── /src
│       ├── /screens
│       ├── /components
│       ├── /hooks
│       ├── /services
│       ├── /types
│       └── /utils
│
└── /backend                  ← To be implemented
    └── /src
        ├── /routes
        │   ├── patients.ts
        │   ├── cases.ts
        │   ├── investigations.ts
        │   ├── management.ts
        │   ├── progressNotes.ts
        │   ├── procedures.ts
        │   ├── lectures.ts
        │   ├── courses.ts
        │   ├── hospitals.ts
        │   ├── search.ts
        │   ├── ai.ts
        │   ├── export.ts
        │   ├── backup.ts
        │   ├── sync.ts
        │   ├── settings.ts
        │   └── media.ts
        ├── /controllers
        ├── /services
        │   ├── patientService.ts
        │   ├── caseService.ts
        │   ├── investigationService.ts
        │   ├── managementService.ts
        │   ├── progressNoteService.ts
        │   ├── procedureService.ts
        │   ├── lectureService.ts
        │   ├── courseService.ts
        │   ├── hospitalService.ts
        │   ├── searchService.ts
        │   ├── aiService.ts
        │   ├── exportService.ts
        │   ├── backupService.ts
        │   ├── syncService.ts
        │   ├── settingsService.ts
        │   └── mediaService.ts
        ├── /models
        ├── /middleware
        │   ├── errorHandler.ts
        │   ├── validation.ts
        │   ├── encryption.ts
        │   └── logger.ts
        ├── /utils
        └── /database
            ├── schema.sql
            └── migrations/
```

### SQLite Database Schema

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  dob_day TEXT NOT NULL,
  dob_month TEXT NOT NULL,
  dob_year TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  file_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'conflict'))
);

CREATE TABLE hospitals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  department TEXT,
  unit TEXT,
  location TEXT,
  position TEXT CHECK (position IN ('intern', 'resident', 'registrar', 'specialist')),
  start_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE cases (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  hospital_id TEXT REFERENCES hospitals(id),
  admission_date TEXT NOT NULL,
  specialty TEXT NOT NULL,
  provisional_diagnosis TEXT,
  final_diagnosis TEXT,
  chief_complaint TEXT,
  history_complaint TEXT,
  present_history TEXT,
  past_medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged')),
  discharge_date TEXT,
  discharge_outcome TEXT,
  discharge_notes TEXT,
  last_modified INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE investigations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Lab Result', 'Imaging', 'Other')),
  date TEXT NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE investigation_images (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  investigation_id TEXT NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE management_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Medications', 'Respiratory Support', 'Feeding')),
  date TEXT NOT NULL,
  medications TEXT,          -- JSON array for Medications type
  chart_image TEXT,
  mode TEXT,                 -- For Respiratory/Feeding
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE progress_notes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  assessment TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE vitals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  progress_note_id TEXT NOT NULL REFERENCES progress_notes(id) ON DELETE CASCADE,
  hr TEXT,
  spo2 TEXT,
  temp TEXT,
  rr TEXT,
  bp TEXT,
  weight TEXT,
  date_time TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE procedures (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  participation TEXT NOT NULL CHECK (participation IN ('Performed', 'Assisted', 'Observed')),
  patient_name TEXT,
  hospital TEXT,
  supervisor TEXT,
  location TEXT,
  indication TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE lectures (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  topic TEXT NOT NULL,
  date TEXT NOT NULL,
  speaker TEXT,
  duration TEXT,
  location TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE courses (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  provider TEXT,
  duration TEXT,
  has_certificate INTEGER NOT NULL DEFAULT 0,
  certificate_path TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE media (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_deleted INTEGER NOT NULL DEFAULT 0,
  sync_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  payload TEXT,             -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE backup_metadata (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  app_version TEXT NOT NULL,
  date TEXT NOT NULL,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'data')),
  size TEXT,
  destination TEXT NOT NULL CHECK (destination IN ('local', 'gdrive')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_cases_patient_id ON cases(patient_id);
CREATE INDEX idx_cases_hospital_id ON cases(hospital_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_last_modified ON cases(last_modified);
CREATE INDEX idx_investigations_case_id ON investigations(case_id);
CREATE INDEX idx_management_case_id ON management_entries(case_id);
CREATE INDEX idx_progress_notes_case_id ON progress_notes(case_id);
CREATE INDEX idx_vitals_progress_note_id ON vitals(progress_note_id);
CREATE INDEX idx_media_case_id ON media(case_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_procedures_date ON procedures(date);
CREATE INDEX idx_lectures_date ON lectures(date);
CREATE INDEX idx_courses_date ON courses(date);
```

### Frontend Integration Pattern

**React Query**:
- Currently uses `QueryClient` but no queries defined (all data is mock/local state)
- Production: queries should use local SQLite via a service layer
- Query key convention: `['patients']`, `['patient', id]`, `['cases', patientId]`, `['case', id]`, etc.

**Offline Queue**:
- All write operations → SQLite first → enqueue to sync_queue
- Background process dequeues and syncs when online
- Conflict resolution: last-write-wins with timestamp comparison

---

## 9. State Management & Data Flow

### Case Creation Flow
```
UI Form (NewCaseScreen)
  → User fills all fields
  → Taps "Save" button
  → Validate required fields (name, DOB, gender, hospital, admission date, specialty)
  → Create patient record in SQLite (if new patient)
  → Create case record in SQLite
  → Mark records as sync_status='pending'
  → Enqueue sync jobs for patient + case
  → React Query cache invalidation: ['patients'], ['cases']
  → Navigate back (navigate(-1))
  → UI refreshes lists
  → Background sync (if online + sync enabled)
  → Update sync_status to 'synced'
```

### Add Investigation Flow
```
CaseDetailScreen → Tap + on Investigations
  → AddInvestigationSheet opens
  → User fills name, type, date, result
  → Optional: attach image
  → Tap Save
  → Create investigation record in SQLite (investigation.case_id = current case)
  → Create investigation_images records if images attached
  → Enqueue sync job
  → onSave callback fires → parent re-fetches
  → Sheet closes
```

### Add Progress Note Flow
```
CaseDetailScreen → Tap + on Progress
  → AddProgressNoteSheet opens
  → User fills date, assessment, vitals (HR, SPO₂, Temp, RR, BP, Weight)
  → Tap Save
  → Create progress_note record
  → Create vitals record (vitals.progress_note_id = new note id)
  → Enqueue sync job
  → onSave callback → parent re-fetches
```

### Discharge Flow
```
CaseDetailScreen → Tap discharge icon
  → Discharge dialog opens
  → User selects date, outcome, optional notes
  → Tap "Discharge"
  → Update case: status='discharged', discharge_date, discharge_outcome, discharge_notes
  → Enqueue sync job
  → UI updates: discharge icon grayed out, status shown
```

### Backup Flow
```
Settings → Tap "Backup Now"
  → CreateBackupSheet opens
  → User selects: backup type, time period, save location
  → Tap "Start Backup"
  → Sheet closes → ProgressSheet opens
  → System creates .medora file:
    1. Export SQLite database
    2. Package images (if full backup)
    3. Generate metadata.json
    4. Create zip, rename to .medora
  → Save to device or upload to Google Drive
  → ProgressSheet shows success
  → Update lastBackupInfo in settings
```

### Restore Flow
```
Settings → Tap "Restore from Backup"
  → RestoreBackupSheet opens (step: select)
  → User taps "Browse Device" or "Browse Google Drive"
  → File picker opens → user selects .medora file
  → Step changes to "confirm"
  → Shows file info + restore type selection (Data+Images / Data Only)
  → WARNING displayed
  → User taps "Restore Now"
  → ProgressSheet opens
  → System:
    1. Validate .medora file
    2. Extract zip contents
    3. Replace SQLite database
    4. Restore images (if full restore)
  → On failure: full rollback
  → On success: app restarts with restored data
```

### Google Drive Sync Flow
```
Settings → Tap "Sync Now"
  → SyncProgressSheet opens
  → Steps:
    1. Connecting to Google Drive (10%)
    2. Checking for changes (30%)
    3. Uploading new records (50%)
    4. Uploading images (75%)
    5. Verifying upload (90%)
    6. Complete (100%)
  → On success: update lastSyncedText
  → On cancel: confirmation dialog → stop sync
  → On error: "Try Again" button available
```

### AI Insights Flow
```
CasesScreen → Insights tab → "Start Analysis"
  → insightState = 'loading'
  → De-identify all active case data (replace patient names with tokens)
  → Send to AI provider
  → Parse response into status groups (red/yellow/green)
  → insightState = 'done'
  → Display results cards
```

### GroupPearl Flow
```
GroupPearlScreen → Fill filters → "Generate GroupPearl"
  → Validate: diagnosis required
  → screenState = 'loading'
  → Query matching cases from local DB
  → If no cases: screenState = 'no_cases'
  → De-identify case data
  → Send to AI provider with diagnosis context
  → Parse response: summary, patterns, comparison, pearl, diseaseReview
  → screenState = 'results'
```

### Export Flow
```
ExportSheet/SettingsExportSheet → Configure options → Tap "Export Now"
  → Filter data by: time period, hospital, categories, case selection
  → Generate file in selected format (PDF/Excel/Word/CSV/JSON)
  → Save to device Downloads or Google Drive
  → ProgressSheet shows progress
  → Download blob to device
```

---

## 10. Image Handling

### Supported Formats
- JPEG, PNG (for investigation images, media)
- JPEG, PNG, PDF (for course certificates)

### Image Settings (configurable in Settings → Image Handling)

**Loading Style**: Lazy Load (always enabled, recommended)

**Image Quality**:
- Auto Compress: Reduce image size on upload
- Keep Original Quality: Store as captured (default)

**Max Image Size**:
- 1 MB per image
- 5 MB per image (recommended, default)
- 10 MB per image
- No limit

### Local Storage Path Structure
```
/medora-data/
├── /cases/{caseId}/
│   ├── /images/{imageId}.jpg
│   └── /investigations/{investigationId}/{imageId}.jpg
├── /courses/{courseId}/
│   └── certificate.{ext}
└── /management/{entryId}/
    └── chart.jpg
```

### Backup Inclusion Rules
- **Full Backup**: database + all images
- **Incremental Backup**: changed records + changed images since last backup
- **Data Only Backup**: database only, no images

### Image Deletion
- When a case is deleted: all associated images deleted
- When an investigation is deleted: associated images deleted
- When media is deleted: image file removed

---

## 11. AI Integration

### De-identification Logic

**Fields replaced before sending to AI**:
- Patient name → randomly generated token (e.g., "Patient A", "Patient B")
- File number → removed
- Hospital name → generic "Hospital X"
- Dates → relative time references (e.g., "Day 1", "Day 3")

**Fields NEVER sent to AI**:
- Patient ID
- File number
- Exact dates of birth
- Hospital IDs
- Google account emails
- API keys

**Mapping table**: RAM-only, never persisted. Generated fresh for each AI request.

### AI Features

#### 1. Insights (CasesScreen → Insights Tab)
- **Trigger**: User taps "Start Analysis" button
- **Input**: All active cases, de-identified
- **Prompt structure**: System prompt requesting clinical analysis, grouped by urgency level
- **Response parsing**: Groups of cases by status (red/yellow/green) with summaries and recommendations
- **Language**: Controlled by `aiLanguage` setting (Arabic or English)

#### 2. GroupPearl (GroupPearlScreen)
- **Trigger**: User fills filters and taps "Generate GroupPearl"
- **Input**: Filtered cases matching diagnosis, time period, outcome
- **Prompt structure**: Request for clinical pattern analysis, comparison, and pearls
- **Response parsing**: Summary, patterns list, comparison, pearl, disease review
- **Language**: Controlled by `aiLanguage` setting

#### 3. CasePearl (CaseDetailScreen)
- **Trigger**: User taps lightbulb icon on case detail
- **Input**: Single case data, de-identified
- **Navigation**: Routes to `/case/:id/pearl` with case data in state
- **Response**: Clinical insights specific to the single case

### AI Provider Configuration
- **Supported providers**: Anthropic (Claude) [recommended], OpenAI (GPT), Custom endpoint
- **Models**: Claude Sonnet (recommended), Claude Opus, Claude Haiku
- **API key storage**: Encrypted in settings (AES-256)
- **Request flow**: App → de-identify → construct prompt → API call → parse response → display

### Error Handling
- Invalid API key → error card → redirect to AI settings
- Timeout → error state with "Try Again"
- Quota exceeded → error message
- Network error → show error state

---

## 12. Sync & Backup Strategy

### Backup

**Types**:
| Type | Contents | Use Case |
|---|---|---|
| Full | Database + all images | Complete backup |
| Incremental | Changed records since last backup | Regular updates |
| Data Only | Database only, no images | Quick save, smaller file |

**File Format**: `.medora`
- Renamed `.zip` archive containing:
  - `database.sqlite` — full SQLite database
  - `images/` folder — all image files (full/incremental only)
  - `metadata.json` — `{ appVersion, date, backupType }`

**Backup Destinations**:
- Local device storage
- Google Drive (`/Medora/Exports/` folder)

### Restore

Steps:
1. File selection (device Files app or Google Drive)
2. File validation (.medora extension check)
3. Restore type selection (Data + Images / Data Only)
4. User confirmation (with WARNING about data overwrite)
5. Execute restore with progress tracking
6. Full rollback on failure

### Google Drive Sync

**OAuth 2.0 Flow**:
- Scopes: email, drive.file
- Multi-account support (connect multiple Gmail accounts)
- Active account selection (one active at a time)

**Sync Frequency Options**:
- Every hour
- Every 6 hours
- Daily (recommended)
- Weekly
- Manual only

**Sync Progress Steps**:
1. Connecting to Google Drive
2. Checking for changes
3. Uploading new records
4. Uploading images
5. Verifying upload
6. Complete

**Conflict Resolution**: Last-write-wins with timestamp comparison.

**Cancel Behavior**: Confirmation dialog → abort sync → "Sync Failed" state → "Try Again" available.

### Export

**Formats**: PDF, DOCX (Word), Excel (.xlsx), CSV, JSON

**Export Scope Options**:
- By category: Cases, Procedures, Lectures, Courses (multi-select)
- By hospital: All Hospitals or specific
- By time period: All, Last Month, 3M, 6M, Year, Custom date range

**Export Destinations**:
- Device Downloads folder
- Google Drive

**Column Configuration**: Each data type defines its own export columns (e.g., procedures export: Name, Date, Participation, Patient, Hospital, Supervisor, Indication, Notes).

---

## 13. Security & Privacy

### Encryption
- **Model**: AES-256
- **Encrypted data**: SQLite database (in backup), API keys, OAuth tokens
- **Backup encryption**: Toggle in Settings (encrypted backup on/off)

### API Key Storage
- Stored in local settings, encrypted
- Displayed masked: first 7 chars + `••••••••••••`
- Show/hide toggle in API Key sheet
- Remove option available

### Authentication (app-level)
- PIN lock (toggle)
- Biometric authentication (toggle)
- Auto-lock timeout (planned)

### Data Privacy
- All data stored locally by default
- No data transmitted without explicit user action
- AI data de-identified before transmission
- Google Drive sync is optional and user-initiated
- Export/backup is user-controlled

### Disclaimers
Comprehensive legal disclaimers in AboutSheet covering:
- Privacy & data security limitations
- Encryption disclaimer (no guarantees)
- Data storage/backup failure possibilities
- Third-party service risks
- AI output warnings (not medical advice)
- Medical disclaimer (documentation tool only)
- Software warranty disclaimer ("AS IS")
- User responsibility acknowledgment

---

## 14. Error States & Edge Cases

| Screen / Feature | Error Type | Trigger | UI Behavior | Handling Strategy |
|---|---|---|---|---|
| PatientsScreen | Empty list | No patients match filters | "No patients match the filters" centered text | Show message, allow clearing filters |
| ProceduresScreen | Empty list | No procedures logged | Icon + "No procedures logged yet" + "Tap + to add" | Show empty state with guidance |
| ProceduresScreen | Filtered empty | No procedures match filter | "No {type} procedures found" | Show filtered empty state |
| CoursesScreen | Empty list | No courses | Icon + "No courses logged yet" | Same pattern |
| SearchScreen | No results | Search yields nothing | Results list empty | Show count "0 Results" |
| NewCaseScreen | Validation | Missing required field | Save button disabled | Button grayed out until required fields filled |
| NewCaseScreen | No patient found | Search yields no existing patients | "No patients found" in dropdown | Show message |
| CaseDetailScreen | Delete confirm | User taps delete | AlertDialog with warning | Require explicit confirmation |
| CaseDetailScreen | Discharge validation | Missing date or outcome | Discharge button disabled | Button grayed out |
| Backup | Operation cancelled | User cancels mid-backup | "Operation cancelled" error state | "Try Again" button available |
| Sync | Cancelled | User cancels mid-sync | "Sync cancelled" with retry | Cancel confirmation dialog first |
| Sync | Failed | Network/auth error | Error state with message | "Try Again" button |
| Restore | File warning | Any .medora file selected | WARNING about data overwrite | Red warning box, explicit "Restore Now" |
| AI Insights | Loading | Analysis in progress | Spinning icon + progress dots | Auto-timeout after delay |
| GroupPearl | Validation | No diagnosis entered | Validation error shown | Show validation message |
| GroupPearl | No cases | No cases match filters | "no_cases" state | Show specific message |
| GroupPearl | Error | AI API failure | "error" state | Show error message |
| GoogleAccount | No account | No accounts connected | "Not connected" state | Show "Connect Google Account" button |
| API Key | No key set | API key empty | "Not set" subtitle | Show placeholder text |
| Hospital delete | Confirmation | User deletes hospital | AlertDialog noting cases NOT deleted | Explicit confirmation required |
| Storage | Device full | Backup or image upload when storage full | Error state in ProgressSheet | Show message: "Not enough storage space. Free up space and try again." |
| Image Upload | File too large | Image exceeds imageMaxSize setting | Inline error below image picker | "Image too large. Maximum allowed: X MB" |
| Image Upload | Invalid format | Non-image file selected | Inline error | "Unsupported format. Use JPEG or PNG." |
| Restore | Corrupted file | .medora file fails validation | Error state in RestoreBackupSheet | "Invalid or corrupted backup file." + "Try Again" |
| Restore | Wrong app version | Backup from incompatible version | Warning dialog | "This backup was created with a newer version of Medora." |
| AI | Quota exceeded | API rate limit hit | Error card in AI screen | "AI quota exceeded. Check your API plan." |
| AI | Invalid API key | Bad key in settings | Error card | "Invalid API key. Go to Settings → AI Integration to update." |
| AI | Timeout | Request takes too long | Error state with retry | "Request timed out. Try again." |
| AI | No cases found | Insights with 0 active cases | Empty state in Insights tab | "No active cases to analyze." |
| Google Drive | Token expired | OAuth token no longer valid | Alert in sync sheet | "Session expired. Reconnect your Google account." |
| Google Drive | Upload failed | Network drop during sync | Error state with retry | "Upload failed. Check your connection and try again." |
| Google Drive | Not connected | Sync triggered with no account | Error state | "No Google account connected. Go to Settings to connect." |
| Settings | No hospitals | Default hospital sheet empty | Empty state | "No hospitals added yet." with link to Manage Hospitals |
| Settings | API key empty | AI feature triggered with no key | Error card | "No API key set. Go to Settings → AI Integration." |
| 404 | Invalid route | User navigates to nonexistent route | 404 page | "Return to Home" link |

---

## 15. Event Map

| Screen | UI Element | Event | Data Operation | API Contract | Payload | Expected Result |
|---|---|---|---|---|---|---|
| CasesScreen | Hospital card | Tap | Read | GET /hospitals/:id | — | Navigate to hospital detail |
| CasesScreen | Patient card | Tap | Read | — | — | Navigate to /patient/:id |
| CasesScreen | "Start Analysis" | Tap | Read/AI | POST /ai/insights | { cases } | AI results displayed |
| CasesScreen | "+ Add New Hospital" | Tap | — | — | — | Navigate to /hospital/new |
| PatientsScreen | Search input | Type | Read (filter) | — | Local filter | Filtered patient list |
| PatientsScreen | Filter chip | Tap | Read (filter) | — | Local filter | Filtered list |
| PatientsScreen | Patient card | Tap | Read | — | — | Navigate to /patient/:id |
| PatientsScreen | "+ Add New" | Tap | — | — | — | Navigate to /case/new |
| PatientDetailScreen | Edit button | Tap | — | — | — | Navigate to edit screen |
| PatientDetailScreen | Case card | Tap | Read | — | — | Navigate to /case/:id |
| PatientDetailScreen | FAB | Tap | — | — | — | Navigate to /case/new |
| CaseDetailScreen | Export icon | Tap | — | — | — | Open ExportSheet |
| CaseDetailScreen | CasePearl icon | Tap | — | — | — | Navigate to pearl |
| CaseDetailScreen | Discharge icon | Tap | — | — | — | Open discharge dialog |
| CaseDetailScreen | Delete icon | Tap | — | — | — | Open delete dialog |
| CaseDetailScreen | Delete confirm | Tap | Delete | DELETE /cases/:id | — | Case deleted, navigate back |
| CaseDetailScreen | Discharge confirm | Tap | Update | PUT /cases/:id/discharge | { date, outcome, notes } | Case status = discharged |
| CaseDetailScreen | + Investigation | Tap | — | — | — | Open AddInvestigationSheet |
| CaseDetailScreen | Save investigation | Tap | Create | POST /cases/:id/investigations | { name, type, date, result } | Investigation created |
| CaseDetailScreen | Edit investigation | Tap | Update | PUT /investigations/:id | { name, type, date, result } | Investigation updated |
| CaseDetailScreen | Delete investigation | Tap | Delete | DELETE /investigations/:id | — | Investigation deleted |
| CaseDetailScreen | + Management | Tap | — | — | — | Open AddManagementSheet |
| CaseDetailScreen | Save management | Tap | Create | POST /cases/:id/management | { type, medications/mode/details } | Entry created |
| CaseDetailScreen | + Progress Note | Tap | — | — | — | Open AddProgressNoteSheet |
| CaseDetailScreen | Save progress | Tap | Create | POST /cases/:id/progress-notes | { date, assessment, vitals } | Note created |
| CaseDetailScreen | "View All" media | Tap | Read | — | — | Navigate to media gallery |
| NewCaseScreen | Save | Tap | Create | POST /cases | Full case payload | Case created, navigate back |
| NewCaseScreen | Patient search | Type | Read | — | Local filter | Filtered patient dropdown |
| NewCaseScreen | Select patient | Tap | — | — | — | Patient auto-filled |
| ProceduresScreen | FAB | Tap | — | — | — | Show add form |
| ProceduresScreen | Save | Tap | Create | POST /procedures | Procedure fields | Procedure created |
| ProceduresScreen | Edit | Tap | — | — | — | Open edit form |
| ProceduresScreen | Delete confirm | Tap | Delete | DELETE /procedures/:id | — | Procedure deleted |
| LecturesScreen | Save | Tap | Create/Update | POST/PUT /lectures | Lecture fields | Lecture saved |
| LecturesScreen | Delete confirm | Tap | Delete | DELETE /lectures/:id | — | Lecture deleted |
| CoursesScreen | Save | Tap | Create/Update | POST/PUT /courses | Course fields | Course saved |
| CoursesScreen | Certificate upload | File select | — | — | — | File attached to form |
| CoursesScreen | Delete confirm | Tap | Delete | DELETE /courses/:id | — | Course deleted |
| GroupPearlScreen | "Generate" | Tap | Read/AI | POST /ai/group-pearl | { diagnosis, timePeriod, outcome } | AI results displayed |
| SearchScreen | Enter | Keypress | Read | GET /search | { q, type } | Results displayed |
| SearchScreen | Recent search pill | Tap | Read | GET /search | { q } | Results displayed |
| SearchScreen | Result card | Tap | — | — | — | Navigate to /case/:id |
| Settings | Theme Color row | Tap | — | — | — | Open ThemeColorSheet |
| Settings | Apply theme | Tap | Update | PUT /settings | { themeColor } | Theme updated |
| Settings | Dark Mode toggle | Toggle | Update | PUT /settings | { darkMode } | UI theme switches |
| Settings | Font Size apply | Tap | Update | PUT /settings | { fontSize } | Font size updated |
| Settings | Date Format apply | Tap | Update | PUT /settings | { dateFormat } | Date format updated |
| Settings | Manage Hospitals | Tap | — | — | — | Open ManageHospitalsSheet |
| Settings | Add hospital | Tap | Create | POST /hospitals | { name, department, unit } | Hospital added |
| Settings | Edit hospital | Tap | Update | PUT /hospitals/:id | { name, department, unit } | Hospital updated |
| Settings | Delete hospital | Tap | Delete | DELETE /hospitals/:id | — | Hospital deleted |
| Settings | AI Provider apply | Tap | Update | PUT /settings | { aiProvider } | Provider updated |
| Settings | API Key save | Tap | Update | PUT /settings | { apiKey } | Key encrypted & saved |
| Settings | API Key remove | Tap | Update | PUT /settings | { apiKey: '' } | Key removed |
| Settings | AI Model apply | Tap | Update | PUT /settings | { aiModel } | Model updated |
| Settings | AI Language apply | Tap | Update | PUT /settings | { aiLanguage } | Language updated |
| Settings | AI Features toggle | Toggle | Update | PUT /settings | { aiFeatures } | Feature toggled |
| Settings | Sync toggle | Toggle | Update | PUT /settings | { syncEnabled } | Sync toggled |
| Settings | Sync Frequency apply | Tap | Update | PUT /settings | { syncFrequency } | Frequency updated |
| Settings | Encrypted Backup toggle | Toggle | Update | PUT /settings | { encryptedBackup } | Toggle updated |
| Settings | Google Account connect | Tap | Create | OAuth flow | — | Account connected |
| Settings | Google Account disconnect | Tap | Delete | — | — | Account removed |
| Settings | "Sync Now" | Tap | Sync | POST /sync | { email } | Sync executed |
| Settings | "Backup Now" | Tap | — | — | — | Open CreateBackupSheet |
| Settings | Start Backup | Tap | Create | POST /backup | { type, destination, period } | Backup created |
| Settings | Restore from Backup | Tap | — | — | — | Open RestoreBackupSheet |
| Settings | Restore Now | Tap | Restore | POST /restore | { fileUri, restoreType } | Data restored |
| Settings | Export Data | Tap | — | — | — | Open SettingsExportSheet |
| Settings | Export Now | Tap | Export | POST /export | { categories, hospital, period, format, saveLocation } | File generated |
| Settings | Image Handling apply | Tap | Update | PUT /settings | { imageQuality, imageMaxSize } | Settings updated |
| Settings | Delete Cloud Data | Tap | Delete | DELETE /cloud-data | — | Cloud data deleted |
| Settings | Clear Local Data | Tap | Delete | — | — | All local data cleared |
| Settings | About | Tap | — | — | — | Open AboutSheet |
| HospitalPatientsScreen | Patient card | Tap | — | — | — | Navigate to /patient/:id |
| HospitalPatientsScreen | Edit hospital | Tap | — | — | — | Open edit sheet |
| HospitalPatientsScreen | Delete hospital | Tap | Delete | DELETE /hospitals/:id | — | Hospital deleted |
| AddHospitalScreen | Save | Tap | Create | POST /hospitals | { name, department, location, position, startDate } | Hospital created |
| EditPatientScreen | Save | Tap | Update | PUT /patients/:id | { name, dob, gender, fileNumber, hospital, admissionDate } | Patient updated |
| MediaGalleryScreen | Image tap | Tap | — | — | — | Fullscreen preview |
| MediaGalleryScreen | Delete image | Tap | Delete | DELETE /media/:id | — | Image deleted |

---

## 16. Naming Conventions

### Variable Names in Forms (exact field names from code)
- `patientName`, `dobDay`, `dobMonth`, `dobYear`, `gender`, `fileNumber`, `hospital`
- `admissionDate`, `specialty`, `provisionalDiagnosis`, `finalDiagnosis`
- `chiefComplaint`, `presentHistory`, `pastMedicalHistory`, `allergies`, `currentMedications`
- `investigationName`, `investigationType`, `investigationDate`, `investigationResult`
- `medications`, `respiratorySupport`, `respiratoryType`, `feeding`
- `progressNoteDate`, `progressNoteAssessment`
- `hr`, `spo2`, `temp`, `rr`, `bp`, `weight`, `vitalDateTime`
- `formName`, `formDate`, `formParticipation`, `formPatient`, `formHospital`, `formSupervisor`, `formIndication`, `formNotes`
- `formProvider`, `formDuration`, `formCertFile`
- `dischargeDate`, `dischargeOutcome`, `dischargeNotes`
- `searchQuery`, `searchType`

### Component Naming Pattern
- Screens: `{Name}Screen` (e.g., `CasesScreen`, `PatientsScreen`)
- Bottom Sheets: `{Name}Sheet` (e.g., `ThemeColorSheet`, `ExportSheet`)
- Case Detail Sheets: `Add{Name}Sheet` (e.g., `AddInvestigationSheet`)
- Layout: `AppShell`
- UI Components: PascalCase (e.g., `FilterChip`, `GenderIcon`, `DisplayField`)

### File Naming Pattern
- Pages: `src/pages/{Name}Screen.tsx`
- Sheets: `src/components/{Name}Sheet.tsx`
- Case detail sheets: `src/components/case-detail/Add{Name}Sheet.tsx`
- UI primitives: `src/components/ui/{name}.tsx` (lowercase, kebab-case)

### API / Service Naming Pattern
- Routes: plural nouns (`/patients`, `/cases`, `/procedures`)
- Services: `{entity}Service.ts`
- Methods: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`

### Database Table Naming Pattern
- Plural, snake_case: `patients`, `cases`, `investigations`, `management_entries`, `progress_notes`, `vitals`, `procedures`, `lectures`, `courses`, `hospitals`, `media`, `settings`, `sync_queue`, `backup_metadata`, `investigation_images`

### Event Handler Naming Pattern
- `handle{Action}`: `handleSave`, `handleDelete`, `handleSearch`, `handleEdit`, `handleRestore`
- `toggle{Thing}`: `toggleSection`, `toggleSub`, `toggleEdit`, `toggleFilter`, `toggleCategory`
- `on{Event}`: `onApply`, `onSave`, `onRemove`, `onChange`, `onClose`, `onOpenChange`
- `set{State}`: `setSelected`, `setProgress`, `setState`

### React Query Key Naming Pattern (recommended)
```typescript
['patients']                    // All patients
['patient', patientId]          // Single patient
['patients', patientId, 'cases'] // Cases for a patient
['case', caseId]                // Single case with all related data
['case', caseId, 'investigations']
['case', caseId, 'management']
['case', caseId, 'progress-notes']
['case', caseId, 'media']
['procedures']
['lectures']
['courses']
['hospitals']
['hospital', hospitalId]
['settings']
['search', query, searchType]
```

### SQLite Column Naming Pattern
- snake_case: `patient_id`, `case_id`, `file_number`, `created_at`, `updated_at`
- Boolean as INTEGER: `is_deleted`, `has_certificate`
- Status fields: TEXT with CHECK constraints
- Timestamps: TEXT in ISO format via `datetime('now')`
- Millisecond timestamps: INTEGER via `strftime('%s', 'now') * 1000`
