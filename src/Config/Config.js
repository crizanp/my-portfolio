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
    { id: '24', name: 'Jupyter Notebooks', imgsrc: '' },
    // Testing
    { id: '30', name: 'React Testing Library', imgsrc: '' },

    // Databases
    { id: '31', name: 'MongoDB', imgsrc: 'images/mongodb.png' },
    { id: '32', name: 'MySQL (basic)', imgsrc: 'images/mysql.png' },

    // Operating Systems
    { id: '34', name: 'Linux (Ubuntu, Debian)', imgsrc: '' },
    { id: '35', name: 'PostGreSQL', imgsrc: '' },

    // Cloud
    { id: '36', name: 'AWS', imgsrc: '' },

    // Embedded OS / Hardware

    // Mathematical Foundations
    { id: '43', name: 'Calculus', imgsrc: '' },
    { id: '44', name: 'Linear Algebra', imgsrc: '' },
    { id: '45', name: 'Probability', imgsrc: '' },
    { id: '46', name: 'Graph Theory', imgsrc: '' },

    // Soft Skills
    { id: '47', name: 'Problem Solving', imgsrc: '' },
    { id: '48', name: 'Analytical Thinking', imgsrc: '' },
    { id: '50', name: 'Documentation', imgsrc: '' },
    { id: '52', name: 'Mentorship', imgsrc: '' },
];

export const ProjImg = [
    { id: '1', name: 'Bhagavad Gita', category: 'react', imgsrc: 'projectImg/react/p_01.jpg', href: 'https://bhagavad-gita-gyan.vercel.app/' },
    { id: '2', name: 'NotePlus', category: 'react', imgsrc: 'projectImg/react/p_7.png', href: 'https://note-plus-react.vercel.app' },
    { id: '3', name: 'Pokemon-app', category: 'react', imgsrc: 'projectImg/react/p_0.jpg', href: 'https://react-pokemon-app1.netlify.app/' },
    { id: '4', name: 'Crypto-Tracker', category: 'react', imgsrc: 'projectImg/react/p_1.jpg', href: 'https://crypto-tracker1.netlify.app/' },
    { id: '5', name: 'Weather-app', category: 'react', imgsrc: 'projectImg/react/p_2.jpg', href: 'https://weather-app-132.netlify.app/' },
    { id: '6', name: 'Snake Game', category: 'javascript', imgsrc: 'projectImg/js/p_0.jpg', href: 'https://narendercoder.github.io/Snake-Game/' },
    { id: '7', name: 'Spotify', category: 'javascript', imgsrc: 'projectImg/js/p_1.jpg', href: 'https://narendercoder.github.io/Spotify/' },
    { id: '8', name: 'Todolist', category: 'react', imgsrc: 'projectImg/react/p_4.jpg', href: 'https://todolist82.netlify.app/' },
    { id: '9', name: 'Tic-Tac-toe', category: 'javascript', imgsrc: 'projectImg/js/p_2.jpg', href: 'https://narendercoder.github.io/Tic_Tac_Toe/' },
    { id: '10', name: 'E-talk', category: 'react', imgsrc: 'projectImg/react/p_5.png', href: 'https://e-talk.vercel.app/' },
    { id: '11', name: 'E-commerce', category: 'react', imgsrc: 'projectImg/react/p_6.png', href: 'https://e-trade.netlify.app/' },
];

export const Experience = [
    {
        id: '1',
        date: 'May 2024 - Nov 2024',
        name: 'Data Analytics Intern',
        company: 'Arihant Poly-Packs Ltd',
        desc: [
            'Worked as a member of Data Analytics and Engineering team.',
            'Reduced raw material waste by more than 10% through data-driven analysis of extrusion and lamination process parameters.',
            'Used statistical tools to track and analyze defect rates.',
            'Analyzed sales data to identify trends and seasonal patterns.',
        ],
    },
    {
        id: '2',
        date: 'Nov 2023 - Apr 2024',
        name: 'Junior Data Engineer (Intern)',
        company: 'Arihant Multi-Fibres Ltd',
        desc: [
            'Created basic ETL pipelines for data automation from source systems to analytics and storage platforms.',
            'Wrote SQL queries for data extraction and manipulation to support reporting and validation.',
            'Performed data cleaning and preprocessing using Python to ensure accuracy and consistency.',
            'Gained experience in data modeling and architecture.',
        ],
    },
    {
        id: '3',
        date: 'Nov 2023 - Jan 2024',
        name: 'Junior Backend Engineer',
        company: 'Theironist.org',
        desc: [
            'Developed and maintained server-side applications using Node.js and Express.js, improving system performance by 30%.',
            'Implemented RESTful APIs for seamless front-end/back-end communication.',
            'Integrated cloud services to optimize backend solutions, reducing operational costs by 25%.',
            'Collaborated on microservices design and used Docker/Kubernetes for containerization and orchestration.',
        ],
    },
    {
        id: '4',
        date: 'Apr 2023 - Oct 2024',
        name: 'HR Manager / Lecturer / Lab Instructor',
        company: 'Sun Beam English School',
        desc: [
            'Managed recruitment processes: posting vacancies, screening resumes, and conducting interviews.',
            'Served as Lecturer for Optional II (Math) and Optional I (Computer Science) for Grade X; developed lesson plans and assessments.',
            'Supervised lab sessions and taught programming fundamentals (QBASIC, Python, C, MS Access).',
            'Supported teacher evaluations and coordinated extracurricular activities as member of Teacher’s Council.',
        ],
    },
    {
        id: '5',
        date: 'Sep 2021 - Mar 2022',
        name: 'Graphic Designer',
        company: 'Dharaksha Ecosolutions',
        desc: ['Collaborated with social media teams.', 'Designed and updated website.', 'Created social media posts and visual assets.'],
    },
    {
        id: '6',
        date: 'Feb 2020 - Present',
        name: 'Digital Artist',
        company: 'Independent',
        desc: ['Self-taught digital artist on Instagram.'],
    },
];

// Summary
export const Summary =
    'Data Scientist with hands-on experience in data analytics, machine learning, and backend systems integration. Skilled at building end-to-end ML workflows, designing ETL pipelines, and integrating analytics with backend services to drive data-driven decisions.';

// Projects (Academic)
export const Projects = [
    {
        id: 'p1',
        title: 'Machine Learning-based Intrusion Detection System (IDS)',
        date: 'Mar 2023',
        desc: [
            'Built an ensemble-based IDS using Decision Tree, Random Forest, Extra Trees, and XGBoost.',
            'Leveraged stacking ensemble to enhance classification performance on CICIDS2017 dataset.',
            'Integrated a GUI to allow CSV input and output generation.',
        ],
        tech: ['Python', 'scikit-learn', 'XGBoost', 'Pandas', 'NumPy'],
    },
    {
        id: 'p2',
        title: 'Course Recommendation System (content-based)',
        date: 'Sep 2023',
        desc: [
            'Built a content-based course recommender using TF-IDF vectorization and cosine similarity.',
            'Processed course titles with NeatText and vectorized using CountVectorizer and TfidfVectorizer.',
            'Developed a Streamlit GUI; serialized data and similarity matrix with Pickle.',
        ],
        tech: ['Python', 'scikit-learn', 'Pandas', 'NeatText', 'Streamlit', 'Pickle'],
    },
    {
        id: 'p3',
        title: 'E-Learning Portal',
        date: 'Mar 2024',
        desc: [
            'Designed and developed a web-based platform for students and instructors to manage online classes and lessons.',
            'Implemented registration, class enrollment, lesson viewing, and role-based access.',
            'Followed the Waterfall model from requirements to testing and deployment.',
        ],
        tech: ['HTML', 'CSS', 'JavaScript', 'Handlebars', 'Node.js', 'Express.js', 'MongoDB'],
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