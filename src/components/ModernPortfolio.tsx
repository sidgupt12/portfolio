import { Mail, Phone, Github, Linkedin, ExternalLink, MapPin, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

// Import project images
import forgetaiImage from "@/assets/forgetai-project.jpg";
import claudeGithubImage from "@/assets/claude-github-project.jpg";
import interviewHelpImage from "@/assets/interviewhelp-project.jpg";
import remoteLogo from "@/assets/remote-logo.jpg";
import cartwigLogo from "@/assets/cartwig-logo.jpg";

export function ModernPortfolio() {
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const [activeSection, setActiveSection] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentWelcomeIndex, setCurrentWelcomeIndex] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const welcomeMessages = [
    { text: "Welcome", lang: "English" },
    { text: "स्वागत", lang: "Hindi" },
    { text: "いらっしゃいませ", lang: "Japanese" },
    { text: "خوش آمدید", lang: "Persian" }
  ];

  useEffect(() => {
    // Theme detection logic
    const detectTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const currentTheme = savedTheme || systemTheme;
      setIsDarkMode(currentTheme === "dark");
      
      // Also check for the 'dark' class on document element
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial theme detection
    detectTheme();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains("dark");
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Preloader logic
    const welcomeInterval = setInterval(() => {
      setCurrentWelcomeIndex((prev) => (prev + 1) % welcomeMessages.length);
    }, 500); // Change welcome message every 500ms

    // Minimum loading time and actual loading completion
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000)); // 4 cycles of welcome messages
    const actualLoad = new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(true);
      } else {
        window.addEventListener('load', () => resolve(true));
      }
    });

    Promise.all([minLoadTime, actualLoad]).then(() => {
      clearInterval(welcomeInterval);
      // Add a small delay before starting the curtain animation
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    });

    return () => {
      clearInterval(welcomeInterval);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-section') || '0');
            setVisibleSections(prev => new Set([...prev, index]));
            
            // Set active section based on which section is most visible
            if (entry.intersectionRatio > 0.5) {
              setActiveSection(index);
            }
          }
        });
      },
      { threshold: [0.1, 0.5] }
    );

    // Scroll progress calculation
    const calculateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    // Initial setup
    document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
    calculateScrollProgress();
    
    // Add scroll listener
    window.addEventListener('scroll', calculateScrollProgress);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', calculateScrollProgress);
    };
  }, []);

  const contactInfo = {
    name: "Siddhant Gupta",
    title: "Software Engineer",
    email: "sidgupt12@gmail.com",
    phone: "+91 9792978291",
    linkedin: "linkedin.com/in/siddhantgupta12",
    github: "github.com/sidgupt12",
    location: "India",
    resume: "https://drive.google.com/file/d/1z3TnNM1jYsA3MAeL19_F5KRYYIDjUb2o/view?usp=sharing"
  };

  const experience = [
    {
      title: "Backend Intern",
      company: "Coding Jr",
      duration: "Jun 2025 - Present",
      logo: "/codingjr.webp",
      type: "Remote", 
      technologies: ["Go", "Fiber", "Redis", "MySQL", "AWS", "Docker"],
      highlights: [
        "Reduced API authentication latency from 50ms to <2ms through intelligent caching",
        "Designed multi-tenant architecture supporting 50+ schools with isolated data access",
        "Developed 100+ REST API endpoints supporting offline learning and real-time notifications"
      ]
    },
    {
      title: "Frontend Intern",
      company: "Cartveg", 
      duration: "Apr 2025 - May 2025",
      logo: null, // Will use text logo
      type: "Remote",
      technologies: ["Next.js", "Tailwind CSS", "Clerk", "React", "TypeScript"],
      highlights: [
        "Built admin panel with Next.js and Tailwind CSS, streamlining e-commerce operations",
        "Improved page load times by 30% through lazy loading and optimized asset delivery",
        "Created reusable UI components and integrated REST APIs with Clerk authentication"
      ]
    }
  ];

  const projects = [
    {
      name: "ForgetAI",
      description: "AI-powered knowledge management system enabling natural language queries for PDFs, tweets, and notes with 99.9% uptime",
      image: "/forgetai.png",
      technologies: ["Go", "Next.js", "MongoDB", "Redis", "Pinecone", "OpenAI", "Google Cloud"],
      metrics: ["99.9% Uptime", "95%+ Query Accuracy", "<200ms Response", "90% Faster Retrieval"],
      liveLink: "https://forgetai.siddhant.cc/",
      githubLinks: [
        { label: "Backend", url: "https://github.com/sidgupt12/forgetai-backend" },
        { label: "Frontend", url: "https://github.com/sidgupt12/forgetai" }
      ]
    },
    {
      name: "Claude-GitHub-MCP",
      description: "Docker-free MCP server for Claude AI, enabling natural language GitHub management with 250+ downloads",
      image: "/gitmcp.png",
      technologies: ["TypeScript", "Node.js", "GitHub API", "Zod"],
      metrics: ["250+ Downloads", "9 Management Tools", "80% Time Reduction", "Zero Critical Bugs"],
      liveLink: null,
      npmLink: "https://www.npmjs.com/package/claude-github-mcp",
      githubLinks: [
        { label: "GitHub", url: "https://github.com/sidgupt12/git-mcp-server" }
      ]
    },
    {
      name: "InterviewHelp",
      description: "AI-driven mock interview platform with voice-based simulations and performance analytics",
      image: "/interviewhelp.png",
      technologies: ["Next.js", "Convex", "AssemblyAI", "Amazon Polly", "Tailwind CSS"],
      metrics: ["Voice Analytics", "Real-time Processing", "Responsive Design", "In Development"],
      liveLink: null,
      githubLinks: [
        { label: "GitHub", url: "https://github.com/sidgupt12/interview-help" }
      ]
    }
  ];

  const skills = {
    languages: ["Go", "Python", "JavaScript", "TypeScript", "SQL", "C/C++"],
    frameworks: ["Next.js", "Tailwind CSS", "Node.js", "Docker", "Git", "MongoDB", "Redis", "Pinecone", "Google Cloud", "AWS"],
    libraries: ["React", "OpenAI SDK", "GitHub API", "Gin", "sqlc", "GORM", "Zod", "Axios", "Clerk"]
  };

  // Flatten all skills for horizontal display
  const allSkills = [
    ...skills.languages,
    ...skills.frameworks, 
    ...skills.libraries
  ];

  const achievements = [
    {
      title: "Research Publication",
      description: "Acceptance of Paper in AECE-2025, Paper ID: 314",
      details: "Adaptive Q-Learning for Robust Navigation in Dynamic 2D Environments for Indian Warehouse Automation"
    },
    {
      title: "Competitive Programming",
      description: "2nd Prize, Coderush Competitive Programming, AKGEC",
      details: "1576 rating in CodeChef and 1247 rating in Codeforces"
    },
    {
      title: "Leadership",
      description: "Head of Programming Club (2024 - Present)",
      details: "Organized coding events with 150+ participants, led training for 20+ members"
    }
  ];

  return (
    <>
      {/* Curtain Preloader */}
      {isLoading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isDarkMode ? 'bg-white' : 'bg-black'}`}>
          {/* Welcome Message */}
          <div className="relative z-10 text-center">
            <h1 
              key={currentWelcomeIndex}
              className={`text-4xl md:text-6xl font-bold bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-black to-gray-800 bg-clip-text text-transparent' 
                  : 'from-white to-gray-300 bg-clip-text text-transparent'
              } animate-pulse`}
            >
              {welcomeMessages[currentWelcomeIndex].text}
            </h1>
            <p className={`text-sm mt-2 opacity-60 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {welcomeMessages[currentWelcomeIndex].lang}
            </p>
          </div>
        </div>
      )}

      {/* Curtain Reveal Animation */}
      <div 
        className={`fixed inset-0 z-[99] ${isDarkMode ? 'bg-white' : 'bg-black'} transition-transform duration-1500 ease-in-out ${
          isLoading ? 'translate-y-0' : '-translate-y-full'
        }`}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Reading Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 bg-muted/20 z-40">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

      {/* Desktop Navigation Header */}
      <nav className="hidden md:block fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-background/20 backdrop-blur-md rounded-full px-8 py-3 border border-white/10 shadow-lg">
          <div className="flex items-center gap-6">
            {[
              { id: 0, label: "Home" },
              { id: 1, label: "Experience" },
              { id: 2, label: "Projects" },
              { id: 3, label: "Skills" },
              { id: 4, label: "Achievements" }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  const element = document.querySelector(`[data-section="${section.id}"]`);
                  if (element) {
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - offset;
                    
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`text-sm font-medium transition-all duration-300 px-3 py-1.5 rounded-full ${
                  activeSection === section.id
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div 
          data-section="0"
          className={`text-center z-10 transition-all duration-1000 ${
            visibleSections.has(0) ? 'animate-fade-in' : 'opacity-0'
          }`}
        >
          <div className="glass-effect rounded-3xl p-12 mx-4 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {contactInfo.name}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
              {contactInfo.title}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 group cursor-pointer hover-lift">
                <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>{contactInfo.location}</span>
              </div>
              <a 
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 group cursor-pointer hover-lift"
              >
                <Mail className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>{contactInfo.email}</span>
              </a>
              <a 
                href={`https://${contactInfo.linkedin}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 group cursor-pointer hover-lift"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>{contactInfo.linkedin}</span>
              </a>
              <a 
                href={`https://${contactInfo.github}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 group cursor-pointer hover-lift"
              >
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>{contactInfo.github}</span>
              </a>
              <a 
                href={contactInfo.resume} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 group cursor-pointer hover-lift"
              >
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>View Resume</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Experience Section */}
        <section className="mb-32">
          <div 
            data-section="1"
            className={`transition-all duration-1000 delay-200 ${
              visibleSections.has(1) ? 'animate-slide-up' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold mb-16 text-center">Experience</h2>
            <div className="max-w-4xl mx-auto space-y-12">
              {experience.map((exp, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-8 py-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-muted/80 via-muted to-muted/60 shadow-lg flex items-center justify-center p-3 border border-muted/20">
                      {exp.logo ? (
                        <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-sm font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                          cartveg
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">{exp.title}</h3>
                    <p className="text-xl text-muted-foreground mb-2">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mb-4">{exp.duration}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {exp.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <ul className="space-y-1 text-sm">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start justify-center md:justify-start">
                          <span className="text-muted-foreground mr-2 mt-0.5">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-32">
          <div 
            data-section="2"
            className={`transition-all duration-1000 delay-400 ${
              visibleSections.has(2) ? 'animate-slide-up' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl font-bold mb-16 text-center">Featured Projects</h2>
            <div className="space-y-8 max-w-6xl mx-auto">
              {projects.map((project, index) => (
                <Card key={index} className="hover-lift border-0 shadow-lg overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="md:w-80 flex-shrink-0">
                        <img 
                          src={project.image} 
                          alt={project.name}
                          className="w-full h-auto object-contain rounded-lg border bg-muted/10"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold mb-2">{project.name}</h3>
                            <p className="text-muted-foreground mb-4">{project.description}</p>
                          </div>
                          
                          <div className="flex gap-2 flex-wrap">
                            {project.liveLink && (
                              <a 
                                href={project.liveLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs hover:opacity-90 transition-opacity"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Live
                              </a>
                            )}
                            {project.npmLink && (
                              <a 
                                href={project.npmLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-full text-xs hover:opacity-90 transition-opacity"
                              >
                                <ExternalLink className="h-3 w-3" />
                                NPM
                              </a>
                            )}
                            {project.githubLinks.map((link, i) => (
                              <a 
                                key={i}
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs hover:bg-muted/80 transition-colors"
                              >
                                <Github className="h-3 w-3" />
                                {link.label}
                              </a>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.slice(0, 4).map((tech, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.technologies.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {project.metrics.map((metric, i) => (
                            <div key={i} className="text-xs text-center p-2 bg-muted/50 rounded-lg">
                              {metric}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* More Projects Link */}
              <div className="flex justify-center pt-8">
                <a 
                  href={`https://${contactInfo.github}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 text-muted-foreground hover:text-foreground transition-all duration-300 border border-muted/30 rounded-full hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="text-sm font-medium">View more projects</span>
                  <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-32">
          <div 
            data-section="3"
            className={`transition-all duration-1000 delay-600 ${
              visibleSections.has(3) ? 'animate-scale-in' : 'opacity-0 scale-95'
            }`}
          >
            <h2 className="text-4xl font-bold mb-16 text-center">Technical Skills</h2>
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-3 justify-center">
                  {allSkills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-4 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-32">
          <div 
            data-section="4"
            className={`transition-all duration-1000 delay-800 ${
              visibleSections.has(4) ? 'animate-fade-in' : 'opacity-0'
            }`}
          >
            <h2 className="text-4xl font-bold mb-16 text-center">Achievements & Leadership</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {achievements.map((achievement, index) => (
                <Card key={index} className="hover-lift border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-bold mb-3">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{achievement.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}
