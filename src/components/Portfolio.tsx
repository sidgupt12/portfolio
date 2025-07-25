import { Mail, Phone, Github, Linkedin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function Portfolio() {
  const contactInfo = {
    name: "Siddhant Gupta",
    email: "sidgupt12@gmail.com",
    phone: "+91 9792978291",
    linkedin: "linkedin.com/in/siddhantgupta12",
    github: "github.com/sidgupt12"
  };

  const experience = [
    {
      title: "Backend Intern",
      company: "Remote",
      duration: "Jun. 2025 - Present",
      technologies: ["Go", "Fiber", "Redis", "MySQL", "AWS", "Docker"],
      achievements: [
        "Reduced API authentication latency from 50ms to <2ms through intelligent caching",
        "Designed and implemented a production-grade API key authentication system following industry best practices",
        "Designed multi-tenant architecture supporting 50+ schools with isolated data access, ensuring data privacy and compliance with educational regulations",
        "Developed 100+ REST API endpoints supporting offline learning, certificates, and real-time notifications",
        "Managed multiple product microservices, orchestrating seamless integration and scalability for diverse educational platforms"
      ]
    },
    {
      title: "Frontend Intern", 
      company: "Cartwig",
      duration: "Apr. 2025 - May 2025",
      technologies: ["Next.js", "Tailwind CSS", "Clerk", "React", "TypeScript"],
      achievements: [
        "Built admin panel with Next.js and Tailwind CSS, streamlining e-commerce operations",
        "Created reusable UI components, reducing page load times",
        "Integrated REST APIs with Clerk authentication for secure data flow",
        "Improved page load times by 30% through lazy loading and optimized asset delivery"
      ]
    }
  ];

  const projects = [
    {
      name: "ForgetAI",
      technologies: ["Go", "Next.js", "MongoDB", "Redis", "Pinecone", "OpenAI", "Google Cloud Run"],
      link: "#",
      description: [
        "Built AI-powered knowledge management system with Go, enabling natural language queries for PDFs, tweets, and notes with 99.9% uptime",
        "Implemented semantic search with Pinecone and OpenAI embeddings, achieving 95%+ query accuracy and <200ms response times",
        "Designed MongoDB and Redis pipeline with intelligent chunking, reducing retrieval latency by 90% via optimized caching",
        "Deployed on Google Cloud Run with Clerk's JWT authentication, ensuring 100% data isolation and zero-downtime deployments",
        "Created responsive Next.js frontend with Tailwind CSS, featuring real-time conversational UI with <100ms updates"
      ]
    },
    {
      name: "Claude-GitHub-MCP",
      technologies: ["TypeScript", "Node.js", "GitHub API"],
      link: "#",
      description: [
        "Built Docker-free MCP server for Claude AI, enabling natural language GitHub management with 250+ downloads",
        "Implemented 9 tools for repository management, PR workflows, and code analysis with full API compatibility",
        "Designed TypeScript architecture with Zod validation and CI/CD, achieving zero critical bugs",
        "Cut PR management time by 80% via natural language, eliminating context switching"
      ]
    },
    {
      name: "InterviewHelp",
      technologies: ["Next.js", "Convex", "AssemblyAI", "Amazon Polly"],
      link: "#",
      description: [
        "Built AI-driven mock interview platform with voice-based simulations",
        "Integrated AssemblyAI for speech-to-text, enabling performance analytics",
        "Designed responsive UI with Tailwind CSS, deployed on Vercel"
      ]
    }
  ];

  const skills = {
    languages: ["Go", "Python", "JavaScript", "TypeScript", "SQL", "C/C++"],
    frameworks: ["Next.js", "Tailwind CSS", "Node.js", "Docker", "Git", "MongoDB", "Redis", "Pinecone", "Google Cloud", "AWS"],
    libraries: ["React", "OpenAI SDK", "GitHub API", "Gin", "sqlc", "GORM", "Zod", "Axios", "Clerk"]
  };

  const education = {
    degree: "B.Tech in Information Technology",
    university: "Dr. APJ Abdul Kalam Technical University",
    cgpa: "8.4",
    duration: "2022 - 2026",
    location: "Ghaziabad"
  };

  const leadership = [
    {
      title: "Head of Programming Club",
      duration: "2024 - Present",
      achievements: [
        "Organized coding events with 150+ participants, fostering technical skills",
        "Led training for 20+ members on algorithms and development"
      ]
    }
  ];

  const achievements = [
    "Fundamentals of Machine Learning with Scikit-learn",
    "2nd Prize, Coderush Competitive Programming, AKGEC",
    "1576 in CodeChef and 1247 in Codeforces",
    "Acceptance of Paper in AECE-2025, Paper ID: 314: 'Adaptive Q-Learning for Robust Navigation in Dynamic 2D Environments for Indian Warehouse Automation'"
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{contactInfo.name}</h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {contactInfo.phone}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {contactInfo.email}
            </div>
            <div className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              {contactInfo.linkedin}
            </div>
            <div className="flex items-center gap-1">
              <Github className="h-4 w-4" />
              {contactInfo.github}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Experience */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Experience</h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <Card key={index} className="border-l-2 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.duration}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exp.technologies.map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex">
                          <span className="text-muted-foreground mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Projects</h2>
            <div className="space-y-6">
              {projects.map((project, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {project.description.map((desc, i) => (
                        <li key={i} className="flex">
                          <span className="text-muted-foreground mr-2">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Skills</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.languages.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Frameworks & Tools</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.frameworks.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Libraries</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.libraries.map((skill, i) => (
                        <Badge key={i} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Education */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Education</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{education.university}</h3>
                    <p className="text-muted-foreground">{education.degree}</p>
                    <p className="text-sm text-muted-foreground">CGPA: {education.cgpa}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{education.location}</p>
                    <p>{education.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Leadership & Activities */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Leadership & Activities</h2>
            <Card>
              <CardContent className="pt-6">
                {leadership.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.duration}</p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {item.achievements.map((achievement, i) => (
                        <li key={i} className="flex">
                          <span className="text-muted-foreground mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Achievements */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Certifications, Achievements & Publications</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  {achievements.map((achievement, i) => (
                    <li key={i} className="flex">
                      <span className="text-muted-foreground mr-2">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}