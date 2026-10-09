// The PDF lives in public/; plain links need the GitHub Pages base path added by hand
export const cvPdfHref = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/Nevidu_Jayatilleke_CV.pdf`;

export const profile = [
    "I am currently a Postgraduate Researcher at the University of Moratuwa, Sri Lanka, specialising in multilingual Natural Language Processing (NLP) with a dedicated focus on advancing AI capabilities for low-resource environments.",
    "My work is driven by the goal of bridging the digital language divide, ensuring that AI technologies are universally accessible and effective across diverse linguistic backgrounds. My primary research expertise lies in computational semantics and diachronic linguistics, specifically modeling the evolution of meaning across historical and canonical timeframes.",
    "My broader research interests include the development of diachronic corpora, machine translation for figures of speech, and benchmarking OCR performance for underrepresented scripts, alongside advancements in automatic text summarisation and information extraction. Through these academic pursuits, I strive to develop technologically inclusive systems capable of handling complex linguistic and cultural nuances on a global scale.",
];

export const education = [
    {
        degree: "MSc (Major Research Component) – Full Time",
        institution: "University of Moratuwa, Sri Lanka",
        period: "Apr 2025 – Present",
        bullets: [
            "Research Area: Diachronic Semantic Drift.",
            "Supervised by Dr. Nisansa De Silva, Department of Computer Science and Engineering.",
        ],
    },
    {
        degree: "BSc(Hons) Artificial Intelligence and Data Science",
        institution: "Robert Gordon University, UK",
        period: "Sep 2020 – May 2024",
        bullets: [
            "First-class honours degree.",
            "Key Modules: Machine Learning, Simulations and Modelling Techniques, Computational Intelligence, Natural Language Processing, Advanced Mathematics for Data Science, Research Trends.",
            "Research Project in the field of text summarisation of patent documents.",
        ],
    },
    {
        degree: "CIE A Levels",
        institution: "Royal Institute International School, Sri Lanka",
        period: "Sep 2014 – Jun 2020",
        bullets: [
            "CIE A Levels: 4As",
            "A Level Subjects: Mathematics, Further Mathematics, Physics, Computer Science",
        ],
    },
];

export const experience = [
    // Current positions (Present) first, then past positions by end date (most recent first)
    {
        role: "Teaching Assistant",
        company: "Department of Computer Science & Engineering, University of Moratuwa",
        period: "Nov 2025 – Present",
        employmentType: "Part-time",
        bullets: [
            "Assessment marking for the Advanced Machine Learning and Big Data Analytics module applies to both Bachelor's and Master's students.",
            "Overseeing the Final Year Teaching Assistants to ensure smooth conduct of Data Structures and Algorithms module labs.",
            "Guide CSE undergraduate students in the Introduction to Data Science and Advanced NLP modules on research studies and paper writing.",
        ],
    },
    {
        role: "Visiting Lecturer",
        company: "Informatics Institute of Technology (IIT Campus)",
        period: "Nov 2025 – Present",
        employmentType: "Part-time",
        bullets: [
            "Supervising final year research projects (2026/2027) on building tokenisers for low-resource languages and word sense disambiguation.",
            "Conducted tutorial sessions on the modules; Natural Language Processing, Final Year Project, and Software Development Fundamentals.",
            "Supervised final year research projects (2025/2026) on Text Summarisation, QnA, Hallucination Detection, OCR, Paraphrasing, Machine Translation and ASR.",
        ],
    },
    {
        role: "Research Assistant (Assistant Lecturer Grade)",
        company: "Informatics Institute of Technology (IIT Campus)",
        period: "Nov 2024 – Nov 2025",
        employmentType: "Full-time",
        bullets: [
            "Assisted in drafting the Sinhala component for a collaborative DFG grant proposal between IIT, University of Jaffna, and FAU Germany, focusing on low-resource LLM data scarcity, dialectal variation, and cultural awareness.",
            "Mentoring final-year students at IIT and UCSC as an advisor in research problems related to NLP and BioInformatics.",
            "Conduct lectures for students on Machine Learning, Deep Learning, NLP, and Research Trends.",
        ],
    },
    {
        role: "Data Scientist",
        company: "LeverEdge Sports – Sydney, Australia",
        period: "Jun 2024 – Jan 2025",
        employmentType: "Contract",
        bullets: [
            "Developing a time series regression model using ensemble machine learning algorithms and deep learning architectures to predict a baseball team's (MLB) scores at different inning intervals during a game.",
            "Implementing Time Series Classification models to classify game-winner at different intervals of the selected sport game using FFNN and 1D-CNN architectures.",
            "Analysing NBA games to predict the winner at each quarter of ongoing games using statistical analysis methods.",
        ],
    },
    {
        role: "Machine Learning Engineer Intern",
        company: "IronOne Technologies LLC",
        period: "Jul 2022 – Jul 2023",
        employmentType: "Internship",
        bullets: [
            "Contributed to a financial fraud detection project using machine learning and deep learning architectures.",
            "Collaborated with domain experts on data imputation, augmentation, dimensionality reduction, encoding, and scaling.",
            "Leveraged Amazon Snowflake and SageMaker for data extraction, analysis, preprocessing, and modelling.",
            "Automated data preprocessing and notebooks to streamline pipelines and support MLOps.",
        ],
    },
];

export const projects = [
    {
        name: "Sinhala & Tamil Mini GPT Implementations",
        description: "PyTorch implementations of decoder-only Transformers (Atto-GPT, Pico-GPT) for character-level language generation in Sinhala and Tamil.",
        links: [],
    },
    {
        name: "Sinhala Constitution RAG Chatbot",
        description: "Naive RAG architecture for the Sinhala Constitution, utilising specialised contextualised and non-contextualised embedding techniques for the Sinhala language.",
        links: [],
    },
    {
        name: "MLB & NBA Score Predictors",
        description: "Time-series regression models, such as Feedforward Neural Networks (FFNN), 1D Convolutional Neural Networks (1D-CNN), and Ensemble methods, are used to predict final game scores.",
        links: [
            { label: "MLB", href: "https://github.com/NeviduJ/MLB-Score-Predictor" },
            { label: "NBA", href: "https://github.com/NeviduJ/NBA-Score-Predictor" },
        ],
    },
    {
        name: "MLB Winner Predictors",
        description: "Time-series classification models, including Feedforward Neural Networks (FFNN), 1D Convolutional Neural Networks (1D-CNN), and ensemble methods, are used to predict the final outcomes of games at various intervals.",
        links: [{ label: "GitHub", href: "https://github.com/NeviduJ/MLB-Winner-Predictor" }],
    },
    {
        name: "Sinhala Text Preprocessing Resources",
        description: "Comprehensive suite of preprocessing tools, including suffix removal, stem dictionaries, tokeniser resources, and Word2Vec embeddings for Sinhala.",
        links: [{ label: "GitHub", href: "https://github.com/NeviduJ/Sinhala-Text-Preprocessing-Resources" }],
    },
];

export const skills = [
    { label: "Languages", items: ["Python", "Java", "R", "SQL"] },
    {
        label: "Technologies",
        items: [
            "TensorFlow", "Keras", "PyTorch", "Pandas", "LangChain", "HuggingFace", "Pandera", "Prefect",
            "Apache Airflow", "Google Cloud Platform", "AWS SageMaker", "Snowflake", "GitHub", "Docker",
        ],
    },
];

export const achievements = [
    {
        title: "Best Paper Award (NLP Track), MERCon 2026",
        detail: "“From Sinhala to Dhivehi: Cross-Lingual Transfer Learning for Low-Resource Speech Recognition”",
    },
    {
        title: "Informatics Institute of Technology Senate Award for Research Excellence 2025",
    },
    {
        title: "Demystifying the Transformer: Build the GPT Core from Scratch",
        detail: "Successful completion of a workshop session at the flagship ICTer 2025 conference organised by the University of Colombo, School of Computing.",
    },
    {
        title: "IELTS — overall score 7.5",
        detail: "Speaking 7.5 · Writing 6.5 · Reading 8.5 · Listening 8.0",
    },
];

export const references = [
    { name: "Dr. Nisansa de Silva", title: "Senior Lecturer at University of Moratuwa" },
    { name: "Dr. Ruvan Weerasinghe", title: "Dean - Research at Informatics Institute of Technology" },
];
