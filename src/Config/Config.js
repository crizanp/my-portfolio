import { BiCodeAlt } from 'react-icons/bi';
import { IoBrushOutline, IoPhonePortraitOutline } from 'react-icons/io5';

export const SkillSet = [
    // Programming Languages
    { id: '1', name: 'Python', imgsrc: 'images/python.png' },
    { id: '3', name: 'JavaScript', imgsrc: 'images/javascript.png' },
    { id: '5', name: 'C', imgsrc: 'images/C.png' },
    { id: '6', name: 'C++', imgsrc: 'images/C++.png' },
    { id: '9', name: 'Node.js', imgsrc: 'images/nodejs.png' },
    { id: '10', name: 'Express.js', imgsrc: 'images/express.png' },
    // Tools & Platforms
    { id: '13', name: 'Git', imgsrc: 'images/git.png' },
    { id: '14', name: 'GitHub', imgsrc: 'images/github.png' },
    { id: '15', name: 'MongoDB', imgsrc: 'images/mongodb.png' },
    { id: '16', name: 'VS Code', imgsrc: 'images/vscode.jpeg' },
    { id: '19', name: 'scikit-learn', imgsrc: 'images/scikit-learn.png' },
    { id: '21', name: 'TensorFlow', imgsrc: 'images/tenserflow.png' },
    { id: '22', name: 'Pandas', imgsrc: 'images/pandas.png' },
    { id: '23', name: 'NumPy', imgsrc: 'images/NumPy.webp' },
    { id: '24', name: 'Jupyter Notebooks', imgsrc: 'images/Jupyter_logo.svg.png' },
    
    // Databases
    { id: '31', name: 'MongoDB', imgsrc: 'images/mongodb.png' },
    { id: '32', name: 'MySQL (basic)', imgsrc: 'images/mysql.png' },

    // Operating Systems
    { id: '34', name: 'Linux (Ubuntu)', imgsrc: 'images/linux.jpeg' },
    { id: '35', name: 'PostGreSQL', imgsrc: 'images/Postgresql_elephant.svg' },

    // Cloud
    { id: '36', name: 'AWS', imgsrc: 'images/aws.png' },

    // Embedded OS / Hardware

    // Mathematical Foundations

    { id: '46', name: 'Graph Theory', imgsrc: 'images/graphtheory.png' },

    // Soft Skills
    { id: '47', name: 'Problem Solving', imgsrc: 'images/problemsolving.jpg' },
    { id: '48', name: 'Analytical Thinking', imgsrc: 'images/analyticalthinking.png' },
    { id: '50', name: 'Latex Documentation', imgsrc: 'images/latex.png' },
];

export const ProjImg = [
    { id: '1', name: 'Digital Ecommerce', category: 'react', imgsrc: 'projectImg/react/digital-ecommerce.png', href: 'https://ecommercereactapp.vercel.app/' },
    { id: '2', name: 'Tools Collection', category: 'react', imgsrc: 'projectImg/react/tool-collection.png', href: 'https://toobox-pro.vercel.app/' },
    { id: '3', name: 'Creative Science Project', category: 'php', imgsrc: 'projectImg/react/creativescienceproject.png', href: 'https://github.com/crizanp/creative-science-project' },
    { id: '4', name: 'Unicode Cnverter', category: 'node', imgsrc: 'projectImg/react/unicode.png', href: 'https://crijan-personal.vercel.app/translation' },
    { id: '5', name: 'College website ', category: 'php', imgsrc: 'projectImg/react/fsu-portfolio.png', href: 'https://github.com/crizanp/college-website-corePHP' },
    { id: '6', name: 'Notes and Documentation', category: 'php', imgsrc: 'projectImg/react/onlinelearnal.png', href: 'https://github.com/crizanp/onlinelearnal_fullstack-php' },
];

export const Experience = [
    {
        id: '1',
        date: 'Dec 2024 - Present',
        name: 'Cofounder',
        company: 'Foxbeep Technology (foxbeep.com)',
        desc: [
            'I am cofounder of Foxbeep Technology, a web development company. We develop websites, web applications, and mobile applications.',
        ],
    },
    {
        id: '2',
        date: 'May 2024 - Nov 2024',
        name: 'Data Analytics Intern',
        company: 'Arihant Poly-Packs Ltd (Golchha Group)',
        desc: [
            'I worked in the Data Analytics and Engineering team. My work helped reduce raw material waste by over 10% by studying the production process. I used statistical tools to track defects and understand their causes. I also looked at sales data to find patterns and seasonal trends.',
        ],
    },
    {
        id: '3',
        date: 'Nov 2023 - Jan 2024',
        name: 'Backend Developer Intern',
        company: 'Nxtech Pvt Ltd (nxtechhosting.com)',
        desc: [
            'Built and maintained server-side applications using Node.js and Express.js, created RESTful APIs, integrated cloud services to reduce costs, and contributed to microservices design using Docker and Kubernetes.',
        ],
    },
    {
        id: '4',
        date: 'Apr 2023 - Oct 2023',
        name: 'HR Manager / Lecturer / Lab Instructor',
        company: 'Udayasi English Secondary School, Gaigat',
        desc: [
            'Managed recruitment, taught Grade X Mathematics and Computer Science, prepared lesson plans and exams, supervised lab sessions on programming (QBASIC, Python, C, MS Access), and supported teacher evaluations and extracurricular activities.',
        ],
    },
    {
        id: '5',
        date: 'Jan 2023 - Dec 2024 (Part-time, Remote)',
        name: 'Marketing & Data Analytics',
        company: 'IGH Digital, Dubai (ighdigital.ae)',
        desc: [
            'Worked remotely on marketing strategies and data analysis. Analyzed campaign performance, tracked KPIs, and provided insights to optimize digital marketing efforts for the Dubai-based company.',
        ],
    },
    {
        id: '6',
        date: 'Sep 2021 - Dec 2021',
        name: 'Graphic Designer',
        company: 'Bal Sadan High School, Morang',
        desc: ['Collaborated with social media teams.', 'Created social media posts and visual assets.'],
    },
];



// Summary
export const Summary =
    'Data Scientist with experience in data analysis, machine learning, and backend development. Good at building ML models, handling data pipelines, and using data to support decisions.';

// Projects (Academic)
export const Projects = [
    
    {
        id: 'p3',
        title: 'Machine Learning - Currency Detection App',
        date: 'Jan 2024',
        desc: [
            'Developed an app to detect and recognize different currency notes using computer vision.',
            'Implemented image processing and classification to identify denominations.',
            'Created a user-friendly interface for mobile use.',
        ],
        tech: ['Python', 'OpenCV', 'TensorFlow', 'Java', 'Android Studio'],
    },
    {
        id: 'p4',
        title: 'Solubility Prediction System for Medical Use',
        date: 'Feb 2024',
        desc: [
            'Built a machine learning system to predict solubility of chemical compounds for pharmaceutical applications.',
            'Used regression models and feature engineering for accurate predictions.',
            'Designed a simple GUI for input and result visualization.',
        ],
        tech: ['Python', 'scikit-learn', 'Pandas', 'NumPy', 'Tkinter'],
    },
    {
        id: 'p5',
        title: 'Home Tuition Marketplace',
        date: 'Mar 2024',
        desc: [
            'Developed a Laravel-based platform connecting tutors and students.',
            'Implemented user registration, course listings, booking system, and payments.',
            'Integrated dashboards for tutors and students to manage classes and schedules.',
        ],
        tech: ['PHP', 'Laravel', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
    },
    {
        id: 'p6',
        title: 'Company Account Management System',
        date: 'Apr 2024',
        desc: [
            'Built a Laravel application to manage company accounts, invoices, and employee records.',
            'Implemented role-based access control and reporting features.',
            'Ensured data security and backup functionality.',
        ],
        tech: ['PHP', 'Laravel', 'MySQL', 'Bootstrap', 'JavaScript'],
    },
    {
        id: 'p7',
        title: 'Governmental Portal (Shram)',
        date: 'May 2024',
        desc: [
            'Developed a government portal using React, Node.js, Next.js, and MongoDB.',
            'Implemented features for citizen registration, service requests, and document management.',
            'Followed best practices for performance, security, and scalability.',
        ],
        tech: ['React', 'Node.js', 'Next.js', 'MongoDB', 'Express.js', 'CSS'],
    },
    {
        id: 'p8',
        title: 'News Aggregator App',
        date: 'Jun 2024',
        desc: [
            'Built a mobile app using React Native to aggregate news from multiple sources.',
            'Implemented search, category filtering, bookmarking, and push notifications.',
            'Optimized app performance and ensured smooth cross-platform experience.',
        ],
        tech: ['React Native', 'Expo', 'JavaScript', 'Firebase', 'REST APIs'],
    },
];


export const Languages = [
    { id: 'l1', name: 'English', level: 'Fluent (Professional Working Proficiency)' },
    { id: 'l2', name: 'Nepali', level: 'Native (Mother Tongue)' },
    { id: 'l3', name: 'Hindi', level: 'Fluent (Professional Working Proficiency)' },
];

export const Education = [
    {
        id: 1,
        date: 'Graduated on: 2024',
        name: ' Tribhuvan University — Institute of Engineering, Purwanchal Campus, Dharan',
        company: ' Bachelor of Engineering in Computer Engineering',
        desc:
            'Relevant Courses: Data Mining, Economics, Discrete Mathematics, Object-Oriented Programming, Database Management Systems, Probability and Statistics, Computer Networks & Security, Software Engineering.\nCampus Involvement: Robotics Club (Purwanchal Campus, Spring 2020); Association of Computer Engineering Students (ACES, Spring 2021).',
    },
];

export const Services = [
    { id: 1, icon: <BiCodeAlt />, name: 'Web Development', desc: 'develop creative web applications' },
    { id: 2, icon: <IoPhonePortraitOutline />, name: 'Application Development', desc: 'develop native applications' },
    { id: 3, icon: <IoBrushOutline />, name: 'Software QA Testing', desc: 'ensure software quality through testing and validation' },
    { id: 4, icon: <BiCodeAlt />, name: 'Prediction Model Development', desc: 'build and deploy machine learning models ' },
    { id: 5, icon: <BiCodeAlt />, name: 'Blockchain Development', desc: 'develop smart contracts using Solidity' },
    { id: 6, icon: <BiCodeAlt />, name: 'Backend & API Development', desc: 'design and implement robust backend systems and RESTful APIs' },
];