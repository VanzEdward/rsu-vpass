/**
 * Romblon State University (RSU) - Main Campus (Odiongan, Romblon)
 * Official Colleges, Undergraduate Degree Programs, and Academic Majors
 */

export const RSU_YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
];

export const RSU_COLLEGES = [
  { code: "ALL", name: "All Colleges / Departments" },
  { code: "CCMADI", name: "College of Computing, Multimedia, Arts and Design (CCMADI)" },
  { code: "CET", name: "College of Engineering and Technology (CET)" },
  { code: "CBA", name: "College of Business and Accountancy (CBA)" },
  { code: "CED", name: "College of Education (CED)" },
  { code: "CAS", name: "College of Arts and Sciences (CAS)" },
];

export const RSU_MAIN_COURSES = [
  // College of Computing, Multimedia, Arts and Design (CCMADI)
  {
    id: "BSIT",
    code: "BSIT",
    name: "BS in Information Technology (BSIT)",
    shortName: "BS Information Technology",
    college: "College of Computing, Multimedia, Arts and Design (CCMADI)",
    collegeCode: "CCMADI",
    majors: [],
  },
  {
    id: "BMMA",
    code: "BMMA",
    name: "Bachelor of Multimedia Arts (BMMA)",
    shortName: "Bachelor of Multimedia Arts",
    college: "College of Computing, Multimedia, Arts and Design (CCMADI)",
    collegeCode: "CCMADI",
    majors: [
      "Graphic and Design",
      "Motion Design",
    ],
  },

  // College of Engineering and Technology (CET)
  {
    id: "BSCE",
    code: "BSCE",
    name: "BS in Civil Engineering (BSCE)",
    shortName: "BS Civil Engineering",
    college: "College of Engineering and Technology (CET)",
    collegeCode: "CET",
    majors: [],
  },
  {
    id: "BSME",
    code: "BSME",
    name: "BS in Mechanical Engineering (BSME)",
    shortName: "BS Mechanical Engineering",
    college: "College of Engineering and Technology (CET)",
    collegeCode: "CET",
    majors: [],
  },
  {
    id: "BSEE",
    code: "BSEE",
    name: "BS in Electrical Engineering (BSEE)",
    shortName: "BS Electrical Engineering",
    college: "College of Engineering and Technology (CET)",
    collegeCode: "CET",
    majors: [],
  },
  {
    id: "BSABE",
    code: "BSABE",
    name: "BS in Agricultural and Biosystems Engineering (BSABE)",
    shortName: "BS Agricultural & Biosystems Eng.",
    college: "College of Engineering and Technology (CET)",
    collegeCode: "CET",
    majors: [],
  },

  // College of Business and Accountancy (CBA)
  {
    id: "BSBA",
    code: "BSBA",
    name: "BS in Business Administration (BSBA)",
    shortName: "BS Business Administration",
    college: "College of Business and Accountancy (CBA)",
    collegeCode: "CBA",
    majors: [
      "Financial Management",
      "Marketing Management",
      "Human Resource Management",
      "Operations Management",
    ],
  },
  {
    id: "BSA",
    code: "BSA",
    name: "BS in Accountancy (BSA)",
    shortName: "BS Accountancy",
    college: "College of Business and Accountancy (CBA)",
    collegeCode: "CBA",
    majors: [],
  },
  {
    id: "BSMA",
    code: "BSMA",
    name: "BS in Management Accounting (BSMA)",
    shortName: "BS Management Accounting",
    college: "College of Business and Accountancy (CBA)",
    collegeCode: "CBA",
    majors: [],
  },
  {
    id: "BSHM",
    code: "BSHM",
    name: "BS in Hospitality Management (BSHM)",
    shortName: "BS Hospitality Management",
    college: "College of Business and Accountancy (CBA)",
    collegeCode: "CBA",
    majors: [],
  },
  {
    id: "BSTM",
    code: "BSTM",
    name: "BS in Tourism Management (BSTM)",
    shortName: "BS Tourism Management",
    college: "College of Business and Accountancy (CBA)",
    collegeCode: "CBA",
    majors: [],
  },

  // College of Education (CED)
  {
    id: "BSED",
    code: "BSEd",
    name: "Bachelor of Secondary Education (BSEd)",
    shortName: "Bachelor of Secondary Education",
    college: "College of Education (CED)",
    collegeCode: "CED",
    majors: [
      "English",
      "Mathematics",
      "Science",
      "Social Studies",
      "Filipino",
    ],
  },
  {
    id: "BEED",
    code: "BEEd",
    name: "Bachelor of Elementary Education (BEEd)",
    shortName: "Bachelor of Elementary Education",
    college: "College of Education (CED)",
    collegeCode: "CED",
    majors: [],
  },
  {
    id: "BPED",
    code: "BPEd",
    name: "Bachelor of Physical Education (BPEd)",
    shortName: "Bachelor of Physical Education",
    college: "College of Education (CED)",
    collegeCode: "CED",
    majors: [],
  },
  {
    id: "BTLED",
    code: "BTLEd",
    name: "Bachelor of Technology & Livelihood Education (BTLEd)",
    shortName: "Bachelor of Technology & Livelihood Educ.",
    college: "College of Education (CED)",
    collegeCode: "CED",
    majors: [
      "Home Economics",
      "Industrial Arts",
      "Information & Communication Technology",
    ],
  },

  // College of Arts and Sciences (CAS)
  {
    id: "ABPOLSCI",
    code: "AB PolSci",
    name: "BA in Political Science (AB PolSci)",
    shortName: "BA Political Science",
    college: "College of Arts and Sciences (CAS)",
    collegeCode: "CAS",
    majors: [],
  },
  {
    id: "BAELS",
    code: "BAELS",
    name: "BA in English Language Studies (BAELS)",
    shortName: "BA English Language Studies",
    college: "College of Arts and Sciences (CAS)",
    collegeCode: "CAS",
    majors: [],
  },
  {
    id: "BSBIO",
    code: "BS Bio",
    name: "BS in Biology (BS Bio)",
    shortName: "BS Biology",
    college: "College of Arts and Sciences (CAS)",
    collegeCode: "CAS",
    majors: ["Ecology", "Biotechnology", "General Biology"],
  },
  {
    id: "BSMATH",
    code: "BS Math",
    name: "BS in Mathematics (BS Math)",
    shortName: "BS Mathematics",
    college: "College of Arts and Sciences (CAS)",
    collegeCode: "CAS",
    majors: [],
  },
];
