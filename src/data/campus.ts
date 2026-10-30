import type { ActivityItem, AppNotification, Doubt, Notice, User } from '@/types/campus'

export const categories = [
  'Academics',
  'Examinations',
  'Placements',
  'Events',
  'Administration',
  'Deadlines',
  'Workshops',
]

export const departments = [
  'All Departments',
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Business Administration',
  'Mathematics',
  'Physics',
]

export const audiences = ['All Campus', 'Students', 'Faculty', 'Office Staff', 'Final Year', 'First Year']

export const demoUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Dr. Meera Krishnan',
    email: 'admin@northbridge.edu',
    role: 'Admin',
    department: 'Academic Affairs',
    title: 'Dean of Academics',
    active: true,
  },
  {
    id: 'u-faculty',
    name: 'Prof. Arjun Rao',
    email: 'arjun.rao@northbridge.edu',
    role: 'Faculty',
    department: 'Computer Science',
    title: 'Associate Professor',
    active: true,
  },
  {
    id: 'u-office',
    name: 'Nisha Menon',
    email: 'office@northbridge.edu',
    role: 'Office Staff',
    department: 'Examinations Office',
    title: 'Senior Office Coordinator',
    active: true,
  },
  {
    id: 'u-student',
    name: 'Aisha Verma',
    email: 'aisha.verma@student.northbridge.edu',
    role: 'Student',
    department: 'Computer Science',
    title: 'B.Tech, Third Year',
    active: true,
  },
  {
    id: 'u-faculty-2',
    name: 'Dr. Kavita Sharma',
    email: 'kavita.sharma@northbridge.edu',
    role: 'Faculty',
    department: 'Mathematics',
    title: 'Professor',
    active: true,
  },
  {
    id: 'u-office-2',
    name: 'Rahul Nair',
    email: 'rahul.nair@northbridge.edu',
    role: 'Office Staff',
    department: 'Admissions Office',
    title: 'Admissions Officer',
    active: true,
  },
  {
    id: 'u-student-2',
    name: 'Dev Patel',
    email: 'dev.patel@student.northbridge.edu',
    role: 'Student',
    department: 'Electronics',
    title: 'B.Tech, Second Year',
    active: true,
  },
]

export const initialNotices: Notice[] = [
  {
    id: 'n-ia-timetable',
    title: 'Internal Assessment Examination Timetable',
    description:
      'The Internal Assessment examinations for the current semester will be conducted from 10 November to 15 November 2026. Students should report to their assigned examination halls 20 minutes before the scheduled start time. Seating plans and hall allocations are available in the attached timetable. Carry your college ID card and hall ticket for every examination.',
    category: 'Examinations',
    priority: 'Urgent',
    audience: ['All Campus', 'Students'],
    department: 'All Departments',
    authorId: 'u-office',
    status: 'Published',
    pinned: true,
    publishAt: '2026-10-28T09:30:00.000Z',
    createdAt: '2026-10-28T09:30:00.000Z',
    attachments: [
      { id: 'a-ia-pdf', name: 'IA-Exam-Timetable-Nov-2026.pdf', type: 'PDF', size: '842 KB' },
      { id: 'a-ia-hall', name: 'Hall-Allocation-List.xlsx', type: 'XLSX', size: '316 KB' },
    ],
  },
  {
    id: 'n-placement',
    title: 'Campus Placement Registration: TechNova Systems',
    description:
      'TechNova Systems will conduct its campus placement drive for final-year students on 12 November 2026. Eligible students from Computer Science, Electronics, and Mathematics must complete registration before 05 November, 5:00 PM. The selection process includes an online aptitude assessment, technical interview, and HR discussion.',
    category: 'Placements',
    priority: 'Important',
    audience: ['Students', 'Final Year'],
    department: 'Computer Science',
    authorId: 'u-admin',
    status: 'Published',
    pinned: true,
    publishAt: '2026-10-27T11:00:00.000Z',
    createdAt: '2026-10-27T11:00:00.000Z',
    attachments: [
      { id: 'a-placement-guide', name: 'TechNova-Placement-Guide.pdf', type: 'PDF', size: '1.2 MB' },
    ],
  },
  {
    id: 'n-hackathon',
    title: 'NorthBridge 24-Hour Technical Hackathon',
    description:
      'The Department of Computer Science is hosting a 24-hour hackathon on 21–22 November 2026. Teams of three to five students can register for tracks in AI, sustainability, fintech, and campus technology. Shortlisted teams will receive mentorship sessions before the final build weekend.',
    category: 'Events',
    priority: 'Normal',
    audience: ['Students'],
    department: 'Computer Science',
    authorId: 'u-faculty',
    status: 'Published',
    pinned: false,
    publishAt: '2026-10-26T14:00:00.000Z',
    createdAt: '2026-10-26T14:00:00.000Z',
    attachments: [
      { id: 'a-hackathon-rules', name: 'Hackathon-Rules-and-Tracks.pdf', type: 'PDF', size: '654 KB' },
    ],
  },
  {
    id: 'n-holiday',
    title: 'Holiday Notification: Founders Day',
    description:
      'The college will remain closed on 03 November 2026 on account of Founders Day. Regular classes and administrative operations will resume on 04 November. Essential campus services will remain available with limited staffing.',
    category: 'Administration',
    priority: 'Normal',
    audience: ['All Campus'],
    department: 'All Departments',
    authorId: 'u-admin',
    status: 'Published',
    pinned: false,
    publishAt: '2026-10-25T08:30:00.000Z',
    createdAt: '2026-10-25T08:30:00.000Z',
    attachments: [],
  },
  {
    id: 'n-project-deadline',
    title: 'Final Year Project Phase I Submission Deadline',
    description:
      'All final-year project groups must submit the Phase I report, supervisor approval page, and plagiarism declaration by 06 November 2026, 4:00 PM. Submissions received after the deadline will require Head of Department approval.',
    category: 'Deadlines',
    priority: 'Important',
    audience: ['Students', 'Final Year'],
    department: 'Computer Science',
    authorId: 'u-faculty',
    status: 'Published',
    pinned: false,
    publishAt: '2026-10-24T13:15:00.000Z',
    createdAt: '2026-10-24T13:15:00.000Z',
    attachments: [
      { id: 'a-report-template', name: 'Phase-I-Report-Template.docx', type: 'DOCX', size: '420 KB' },
    ],
  },
  {
    id: 'n-workshop',
    title: 'Department Workshop: Applied Machine Learning',
    description:
      'The Computer Science Department is organizing a two-day applied machine learning workshop on 18–19 November 2026. The workshop covers model evaluation, responsible AI, and deployment case studies. Seats are limited to 80 participants.',
    category: 'Workshops',
    priority: 'Normal',
    audience: ['Students', 'Faculty'],
    department: 'Computer Science',
    authorId: 'u-faculty',
    status: 'Scheduled',
    pinned: false,
    publishAt: '2026-11-02T09:00:00.000Z',
    createdAt: '2026-10-23T10:00:00.000Z',
    attachments: [
      { id: 'a-workshop-schedule', name: 'Applied-ML-Workshop-Schedule.pdf', type: 'PDF', size: '512 KB' },
    ],
  },
  {
    id: 'n-fee-circular',
    title: 'Semester Fee Payment Window',
    description:
      'The fee payment window for the next semester opens on 05 November 2026 and closes on 20 November 2026. Students with approved scholarships must submit the scholarship confirmation letter to the accounts office before payment.',
    category: 'Administration',
    priority: 'Important',
    audience: ['Students'],
    department: 'All Departments',
    authorId: 'u-office',
    status: 'Scheduled',
    pinned: false,
    publishAt: '2026-11-04T08:00:00.000Z',
    createdAt: '2026-10-22T15:20:00.000Z',
    attachments: [
      { id: 'a-fee-circular', name: 'Semester-Fee-Circular.pdf', type: 'PDF', size: '736 KB' },
    ],
  },
  {
    id: 'n-library',
    title: 'Central Library Extended Hours',
    description:
      'The Central Library will remain open until 10:00 PM on weekdays from 01 November to 20 December 2026 to support examination preparation. Students must carry a valid ID card for entry after 7:00 PM.',
    category: 'Administration',
    priority: 'Normal',
    audience: ['All Campus'],
    department: 'All Departments',
    authorId: 'u-office',
    status: 'Archived',
    pinned: false,
    publishAt: '2026-10-12T09:00:00.000Z',
    createdAt: '2026-10-12T09:00:00.000Z',
    archivedAt: '2026-10-26T17:00:00.000Z',
    attachments: [],
  },
  {
    id: 'n-sports-meet',
    title: 'Annual Sports Meet Registrations',
    description:
      'Registrations for the Annual Sports Meet are now closed. The final event schedule and team lists have been circulated to department sports coordinators.',
    category: 'Events',
    priority: 'Normal',
    audience: ['Students'],
    department: 'All Departments',
    authorId: 'u-office',
    status: 'Archived',
    pinned: false,
    publishAt: '2026-10-08T12:00:00.000Z',
    createdAt: '2026-10-08T12:00:00.000Z',
    archivedAt: '2026-10-22T16:00:00.000Z',
    attachments: [
      { id: 'a-sports-schedule', name: 'Sports-Meet-Final-Schedule.pdf', type: 'PDF', size: '488 KB' },
    ],
  },
]

export const initialDoubts: Doubt[] = [
  {
    id: 'd-ia-clash',
    title: 'Can the IA timetable change if two exams overlap?',
    description:
      'Two of my elective examinations appear on the same afternoon. I would like to know the process for reporting the clash and whether the revised timetable will be published separately.',
    noticeId: 'n-ia-timetable',
    authorId: 'u-student',
    department: 'Computer Science',
    status: 'Unanswered',
    createdAt: '2026-10-29T10:20:00.000Z',
    attachments: [],
    responses: [],
  },
  {
    id: 'd-placement-cgpa',
    title: 'Is the TechNova CGPA eligibility criterion strict?',
    description:
      'The placement guide mentions a 7.5 CGPA criterion. Will students with 7.4 CGPA and relevant project experience be considered during resume shortlisting?',
    noticeId: 'n-placement',
    authorId: 'u-student',
    department: 'Computer Science',
    status: 'Answered',
    createdAt: '2026-10-28T15:10:00.000Z',
    attachments: [],
    responses: [
      {
        id: 'r-placement-1',
        authorId: 'u-admin',
        body:
          'The 7.5 CGPA requirement is a strict screening criterion for this drive. Students below the cutoff can attend the pre-placement talk, but they will not be shortlisted for the assessment round.',
        createdAt: '2026-10-28T17:45:00.000Z',
      },
    ],
  },
  {
    id: 'd-hackathon-team',
    title: 'Can a hackathon team include students from two departments?',
    description:
      'Our team has two students from Computer Science and one from Electronics. The registration form asks for a single department, so we want to confirm whether mixed teams are allowed.',
    noticeId: 'n-hackathon',
    authorId: 'u-student-2',
    department: 'Electronics',
    status: 'Answered',
    createdAt: '2026-10-27T09:10:00.000Z',
    attachments: [],
    responses: [
      {
        id: 'r-hackathon-1',
        authorId: 'u-faculty',
        body:
          'Mixed-department teams are allowed. Select the department of the team lead in the registration form and mention all member departments in the team notes field.',
        createdAt: '2026-10-27T12:30:00.000Z',
      },
    ],
  },
  {
    id: 'd-project-format',
    title: 'Should the Phase I report include the plagiarism receipt?',
    description:
      'The notice asks for a plagiarism declaration, but the template has no separate section for the receipt. Should we merge the receipt into the final PDF or submit it separately?',
    noticeId: 'n-project-deadline',
    authorId: 'u-student',
    department: 'Computer Science',
    status: 'Unanswered',
    createdAt: '2026-10-29T18:05:00.000Z',
    attachments: [
      { id: 'a-project-screenshot', name: 'Report-Template-Section.png', type: 'PNG', size: '244 KB' },
    ],
    responses: [],
  },
  {
    id: 'd-holiday-lab',
    title: 'Will research labs remain open on Founders Day?',
    description:
      'A few final-year students have scheduled experiments that cannot be paused. Please confirm whether the research labs will be accessible on the holiday.',
    noticeId: 'n-holiday',
    authorId: 'u-faculty-2',
    department: 'Mathematics',
    status: 'Answered',
    createdAt: '2026-10-26T13:40:00.000Z',
    attachments: [],
    responses: [
      {
        id: 'r-holiday-1',
        authorId: 'u-admin',
        body:
          'Research labs will remain closed. Exceptional access requires written approval from the Head of Department and the Principal at least two working days before the holiday.',
        createdAt: '2026-10-26T15:05:00.000Z',
      },
    ],
  },
]

export const initialNotifications: AppNotification[] = [
  {
    id: 'nt-1',
    title: 'Urgent notice published',
    body: 'Internal Assessment Examination Timetable is now available with hall allocation attachments.',
    type: 'notice',
    createdAt: '2026-10-28T09:30:00.000Z',
    unread: true,
    link: '/notices/n-ia-timetable',
  },
  {
    id: 'nt-2',
    title: 'Your doubt received a response',
    body: 'TechNova eligibility doubt was answered by the Academic Affairs office.',
    type: 'doubt',
    createdAt: '2026-10-28T17:45:00.000Z',
    unread: true,
    link: '/doubts/d-placement-cgpa',
  },
  {
    id: 'nt-3',
    title: 'Notice scheduled',
    body: 'Applied Machine Learning Workshop is scheduled for publication on 02 November.',
    type: 'notice',
    createdAt: '2026-10-23T10:00:00.000Z',
    unread: false,
    link: '/scheduled',
  },
]

export const initialActivities: ActivityItem[] = [
  {
    id: 'ac-1',
    actorId: 'u-office',
    action: 'published',
    target: 'Internal Assessment Examination Timetable',
    createdAt: '2026-10-28T09:30:00.000Z',
    type: 'notice',
  },
  {
    id: 'ac-2',
    actorId: 'u-admin',
    action: 'responded to',
    target: 'TechNova CGPA eligibility doubt',
    createdAt: '2026-10-28T17:45:00.000Z',
    type: 'doubt',
  },
  {
    id: 'ac-3',
    actorId: 'u-faculty',
    action: 'scheduled',
    target: 'Department Workshop: Applied Machine Learning',
    createdAt: '2026-10-23T10:00:00.000Z',
    type: 'notice',
  },
  {
    id: 'ac-4',
    actorId: 'u-office',
    action: 'archived',
    target: 'Central Library Extended Hours',
    createdAt: '2026-10-26T17:00:00.000Z',
    type: 'notice',
  },
]
