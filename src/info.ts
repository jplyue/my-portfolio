export const educationScene = {
  title: "Education",
  items: [
    {
      school: "Glasgow School of Art, Glasgow, UK",
      date: "Sept. 2024 – Jul 2026 (expected)",
      degree: "Master of Design and Communication Design",
      courses:
        "Design Research Methods, A Critically Reflective Practice, Studio Practice"
    },
    {
      school: "The University of Edinburgh, Edinburgh, UK",
      date: "Sept. 2014 – Sept. 2015",
      degree: "Master of Science in Design and Digital Media",
      courses:
        "Dynamic Web Design, Interactive Sound Environments"
    },
    {
      school: "Beijing Normal–Hong Kong Baptist University, Zhuhai, China",
      date: "Sept. 2010 – Sept. 2014",
      degree: "Bachelor of Science in Computer Science and Technology",
      courses:
        "Object-Oriented Programming, Data Structures, Database Management System"
    }
  ]
}

export const workScene = {
  title: "Work Experience",
  items: [
    {
      company: "Compass (U.S.), Beijing, China",
      role: "Frontend Developer",
      date: "Feb 2020 – Jan 2023",
      points: [
        "Built and maintained custom real estate search pages for multiple U.S. states, ensuring data accuracy and feature consistency with official government property sites.",
        "Delivered new UI features and components with optimized code solutions after peer design discussions; wrote unit tests (Jest) and ensured end-to-end test coverage (Cypress).",
        "Contributed to project iterations and framework migration from Formik to MobX, enhancing state management performance and maintainability.",
        "Participated in code reviews and cross-timezone collaboration with U.S.-based PMs and engineers.",
        "Supported CI/CD workflows and staging deployments before release."
      ]
    },
    {
      company: "Ctrip, Shanghai, China",
      role: "Frontend Developer",
      date: "Sept 2018 – Sept 2019",
      points: [
        "Designed and implemented the Tangtu Project, a backend system for marketing teams to upload images and text, auto-generating HTML marketing pages for end users.",
        "Built JSON-based configurable templates (carousels, lists, etc.), enabling business teams to create and modify marketing pages independently.",
        "Collaborated with backend engineers to design, validate, and debug data formats; developed H5 interactive pages and lightweight games to enhance campaign engagement.",
        "Rebuilt visa application form pages across PC and mobile apps to adapt to frequently changing policies, ensuring data accuracy and user compliance.",
        "Refactored legacy form pages by creating a unified configuration system that automatically generated country-specific forms, reducing development and testing costs."
      ]
    },
    {
      company: "China Television Information Technology, Beijing, China",
      role: "Frontend Developer",
      date: "Dec 2015 – Jun 2018",
      points: [
        "Contributed to the development of a Content Management System (CMS), enabling editors to manage and publish multimedia content more efficiently; Built reusable frontend components (e.g., iList) that allowed the backend team to configure and embed modules directly, reducing repetitive development work.",
        "Implemented drag-and-drop table features using jQuery, improving usability for non-technical content editors.",
        "Collaborated closely with backend engineers to design data structures, debug integration issues, and validate stored content formats, ensuring accurate rendering on live sites; Expanded and maintained the company’s frontend template library, streamlining content creation workflows and supporting scalability of future CMS features."
      ]
    }
  ]
}
// ===== Skills Scene Data =====
export const skillsScene = {
  title: "Skills",
  items: [
    {
      label: "Languages",
      content: "Python (Django), C, C#, Java, SQL, JavaScript"
    },
    {
      label: "Frameworks & Libraries",
      content: "React.js, Redux, MobX, GraphQL, HTML5, CSS3, Jest, Cypress"
    },
    {
      label: "Tools",
      content: "Git, CI/CD"
    }
  ]
}