import React, { useEffect } from 'react';
import { 
  ArrowLeft, Mail, Phone, ExternalLink, Briefcase, 
  GraduationCap, Award, BookOpen, CheckCircle2,
  MapPin, Code2, Terminal, Cpu, Microscope
} from 'lucide-react';
import avishekPhoto from '../assets/avishek.png';
import '../Portfolio.css';

const Portfolio = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="portfolio-overlay">
      <div className="portfolio-container">
        {/* Back Button */}
        <button className="portfolio-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {/* HERO SECTION */}
        <section className="portfolio-hero">
          <div className="hero-content">
            <div className="profile-img-container">
              <img src={avishekPhoto} alt="Avishek Senapati" className="portfolio-img" />
              <div className="img-glow-ring"></div>
            </div>
            <div className="hero-details">
              <h1>Avishek Senapati</h1>
              <p className="hero-title">QA Automation Engineer | QA Lead @ PwC India, Kolkata</p>
              <p className="hero-tagline">"5.9+ years building quality at scale — from BFSI to Travel & Hospitality"</p>
              <div className="hero-info">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>Kolkata, West Bengal, India</span>
                </div>
                <div className="info-item">
                  <Mail size={16} />
                  <span>avi1507020@gmail.com</span>
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <span>+91-8348701646</span>
                </div>
              </div>
              <a 
                href="https://www.linkedin.com/in/avisheksenapatiqa/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="linkedin-cta"
              >
                <ExternalLink size={20} />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </section>

        <div className="portfolio-grid">
          {/* ABOUT SECTION */}
          <section className="portfolio-section">
            <h2 className="section-header">
              <BookOpen size={24} className="accent-icon" />
              About Me
            </h2>
            <div className="glass-card portfolio-card">
              <p className="about-text">
                Certified ISTQB QA Professional with 5.9+ years of expertise in test automation and quality assurance 
                across BFSI and Travel & Hospitality domains. Currently serving as QA Lead at PwC India, 
                managing a team of 5 QA engineers and driving quality initiatives that deliver measurable business impact. 
                Passionate about designing scalable automation frameworks, leveraging AI-driven testing tools, 
                and mentoring the next generation of QA engineers.
              </p>
            </div>
          </section>

          {/* EXPERIENCE SECTION */}
          <section className="portfolio-section">
            <h2 className="section-header">
              <Briefcase size={24} className="accent-icon" />
              Professional Experience
            </h2>
            <div className="experience-timeline">
              <div className="glass-card portfolio-card experience-card">
                <div className="exp-icon"><CheckCircle2 size={18} /></div>
                <div className="exp-details">
                  <h3>PwC India</h3>
                  <div className="exp-meta">
                    <span className="role">QA Engineer – Automation (QA Lead)</span>
                    <span className="date">July 2022 – Present | Kolkata, India</span>
                  </div>
                  <div className="exp-projects">
                    <p><strong>Projects:</strong> Sightline (Global Tax Technology Platform), Checkpoint Automation</p>
                    <p><strong>Domain:</strong> BFSI / Taxation</p>
                  </div>
                </div>
              </div>

              <div className="glass-card portfolio-card experience-card">
                <div className="exp-icon"><CheckCircle2 size={18} /></div>
                <div className="exp-details">
                  <h3>Cognizant Technology Solutions</h3>
                  <div className="exp-meta">
                    <span className="role">Associate QA Engineer</span>
                    <span className="date">November 2019 – June 2022 | Kolkata, India</span>
                  </div>
                  <div className="exp-projects">
                    <p><strong>Projects:</strong> Burger King (Restaurant Brands International), Chili's & Maggiano's, Jack in the Box</p>
                    <p><strong>Domain:</strong> Travel & Hospitality / eCommerce</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SKILLS SECTION */}
          <section className="portfolio-section full-width">
            <h2 className="section-header">
              <Code2 size={24} className="accent-icon" />
              Core Skills
            </h2>
            <div className="glass-card portfolio-card skills-container">
              <div className="skills-group">
                <h3>Automation & Testing</h3>
                <div className="skills-pills">
                  {['Selenium WebDriver', 'Playwright .NET', 'C#', 'Java (Core)', 'SpecFlow', 'Reqnroll (BDD)', 'Page Object Model', 'TestNG', 'Robot Framework', 'RestSharp', 'API Testing'].map(skill => (
                    <span key={skill} className="skill-pill">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="skills-group">
                <h3>Tools & Platforms</h3>
                <div className="skills-pills">
                  {['Azure DevOps', 'Azure DevOps Pipelines', 'Git', 'JIRA', 'Zephyr', 'Postman', 'Swagger', 'Azure Test Plans', 'Visual Studio 2022', 'Jenkins', 'Maven', 'MSBuild'].map(skill => (
                    <span key={skill} className="skill-pill">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="skills-group">
                <h3>AI Tools & Methodologies</h3>
                <div className="skills-pills">
                  {['Functionize AI Testing', 'AI-Powered Test Automation', 'Agile/Scrum', 'Waterfall', 'CI/CD Integration', 'Sprint Planning', 'Backlog Refinement'].map(skill => (
                    <span key={skill} className="skill-pill">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CERTIFICATIONS SECTION */}
          <section className="portfolio-section">
            <h2 className="section-header">
              <Award size={24} className="accent-icon" />
              Certifications
            </h2>
            <div className="cert-grid">
              {[
                { title: 'ISTQB® Advanced Level – Test Manager', icon: '🥇' },
                { title: 'ISTQB® Advanced Level – Technical Test Analyst V4.0', icon: '🥇' },
                { title: 'ISTQB® Foundation Level (CTFL)', icon: '🥇' },
                { title: 'Functionize AI Testing Certification', icon: '🤖' },
                { title: 'Certified Scrum Product Owner (CSPO)', icon: '🏅' }
              ].map(cert => (
                <div key={cert.title} className="glass-card portfolio-card cert-card">
                  <span className="cert-icon">{cert.icon}</span>
                  <p>{cert.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* AWARDS SECTION */}
          <section className="portfolio-section">
            <h2 className="section-header">
              <Award size={24} className="accent-icon" />
              Awards
            </h2>
            <div className="awards-container">
              <div className="glass-card portfolio-card award-card">
                <span className="award-emoji">🌟</span>
                <div className="award-details">
                  <h3>PwC India STAR&R Client Appreciation Award</h3>
                  <p>Outstanding individual performance and exceptional delivery to PwC US Client</p>
                </div>
              </div>
              <div className="glass-card portfolio-card award-card">
                <span className="award-emoji">🏆</span>
                <div className="award-details">
                  <h3>PwC India Best Team Award</h3>
                  <p>Recognition for excellent project delivery and team collaboration</p>
                </div>
              </div>
              <div className="glass-card portfolio-card award-card">
                <span className="award-emoji">🎉</span>
                <div className="award-details">
                  <h3>Cognizant Cheers Award</h3>
                  <p>Senior Manager recognition for outstanding performance and client-focused delivery</p>
                </div>
              </div>
            </div>
          </section>

          {/* EDUCATION SECTION */}
          <section className="portfolio-section full-width">
            <h2 className="section-header">
              <GraduationCap size={24} className="accent-icon" />
              Education
            </h2>
            <div className="education-grid">
              <div className="glass-card portfolio-card edu-card">
                <div className="edu-header">
                  <GraduationCap size={20} className="edu-icon" />
                  <div>
                    <h3>Bachelor of Technology (B.Tech)</h3>
                    <p className="edu-field">Electrical & Electronics Engineering</p>
                  </div>
                </div>
                <p className="edu-inst">Kalinga Institute of Industrial Technology (KIIT), Bhubaneswar</p>
                <p className="edu-period">2015 – 2019</p>
              </div>

              <div className="glass-card portfolio-card edu-card">
                <div className="edu-header">
                  <GraduationCap size={20} className="edu-icon" />
                  <div>
                    <h3>Master of Business Administration (MBA)</h3>
                    <p className="edu-field">Strategy and Leadership</p>
                  </div>
                </div>
                <p className="edu-inst">Liverpool John Moores University</p>
                <p className="edu-period">Sep 2021 – Jul 2023</p>
              </div>

              <div className="glass-card portfolio-card edu-card">
                <div className="edu-header">
                  <GraduationCap size={20} className="edu-icon" />
                  <div>
                    <h3>PG Program in Management (PGPM)</h3>
                  </div>
                </div>
                <p className="edu-inst">Institute of Management Technology (IMT), Ghaziabad</p>
                <p className="edu-period">Sep 2021 – Aug 2022</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
