import React from 'react';
import styled from 'styled-components';
import { FaUniversity, FaBriefcase, FaProjectDiagram, FaTools, FaLanguage } from 'react-icons/fa';
import { SkillSet, Experience, Education, Summary, Projects, Languages } from '../Config/Config';

function Resume() {
  return (
    <Wrapper className="resume-section">
      <div className="card-inner" id="resume">
        <div className="card-wrap">
          <div className="content resume">
          <div className="title" data-aos="fade-up">
            <span>Resume</span>
          </div>

          {Summary && (
            <div className="summary" data-aos="fade-up">
              <p>{Summary}</p>
            </div>
          )}

          <div className="row">
            <div className="col col-6 border-line-v" style={{ width: '100%' }}>
              {/* Education (1st) */}
              <div className="resume-title border-line-h">
                <div className="icon" data-aos="fade-up"><FaUniversity /></div>
                <div className="name" data-aos="fade-up">Education</div>
              </div>
              <div className="resume-items">
                {Education.map((edu, i) => (
                  <div key={edu.id} className="resume-item" data-aos="fade-up" data-aos-delay={(i + 1) * 80}>
                    <div className="date">{edu.date}</div>
                    <div className="name"><strong>College:</strong> {edu.name}</div>
                    <div className="company"><strong>Field:</strong> {edu.company}</div>

                    {/* Parse description lines and render labeled paragraphs */}
                    {edu.desc && edu.desc.split('\n').map((part, idx) => {
                      const text = part.trim();
                      if (!text) return null;
                      if (/^Relevant Courses?:/i.test(text)) {
                        return (
                          <p key={idx}><strong>Relevant course:</strong> {text.replace(/^Relevant Courses?:/i, '').trim()}</p>
                        );
                      }
                      if (/^(Campus Involvement:|Involvement:)/i.test(text)) {
                        return (
                          <p key={idx}><strong>Involvement:</strong> {text.replace(/^(Campus Involvement:|Involvement:)/i, '').trim()}</p>
                        );
                      }
                      return <p key={idx}>{text}</p>;
                    })}
                  </div>
                ))}
              </div>

              {/* Experience (2nd) */}
              <div className="resume-title border-line-h" style={{ marginTop: 60 }}>
                <div className="icon" data-aos="fade-up"><FaBriefcase /></div>
                <div className="name" data-aos="fade-up">Experience</div>
              </div>
              <div className="resume-items">
                {Experience.map((exp, i) => (
                  <div key={exp.id} className="resume-item" data-aos="fade-up" data-aos-delay={(i + 1) * 80}>
                    <div className="date">{exp.date}</div>
                    <div className="name">{exp.name}</div>
                    <div className="company">{exp.company}</div>
                    <div className="experience-desc">
                      <ul>{exp.desc.map((d, j) => (<li key={`${exp.id}-d-${j}`}>{d}</li>))}</ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects (3rd) */}
              <div className="resume-title border-line-h" style={{ marginTop: 60 }}>
                <div className="icon" data-aos="fade-up"><FaProjectDiagram /></div>
                <div className="name" data-aos="fade-up">Academic Projects</div>
              </div>
              <div className="row grid-items border-line-v">
                <ul className="grid-item project-list">
                  {Projects.map((p) => (
                    <li key={p.id}>
                      <div className="project-card">
                        <div className="card-title">
                          <span className="title">{p.title}</span>
                          <div className="date">{p.date}</div>
                        </div>
                        <div className="proj-desc">
                          <ul>{p.desc.map((d, i) => (<li key={i}>{d}</li>))}</ul>
                          <div className="tech">{p.tech && p.tech.map((t, idx) => (<span key={idx} className="tag">{t}</span>))}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div className="resume-title border-line-h" style={{ marginTop: 60 }}>
                <div className="icon" data-aos="fade-up"><FaTools /></div>
                <div className="name" data-aos="fade-up">Skills</div>
              </div>
              <div className="skills">
                {SkillSet.map((s) => (
                  <div key={s.id} className="skill">
                    {s.imgsrc ? (
                      <img src={s.imgsrc} alt={s.name} />
                    ) : (
                      <FaTools className="skill-icon" />
                    )}
                    <span className="skill-name">{s.name}</span>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div className="resume-title border-line-h" style={{ marginTop: 24 }}>
                <div className="icon" data-aos="fade-up"><FaLanguage /></div>
                <div className="name" data-aos="fade-up">Languages</div>
              </div>
              <div className="languages">
                <ul>
                  {Languages.map((l) => (
                    <li key={l.id}><FaLanguage className="lang-icon" /> <strong>{l.name}:</strong> {l.level}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

export default Resume;

/* Styled components for a clean, professional layout */
const Main = styled.section`
  padding: 24px 32px;
  color: ${({ theme }) => theme.title.primary};
  background: ${({ theme }) => theme.bg.primary};
`;

const Header = styled.header`
  margin-bottom: 20px;
  h2 { margin: 0 0 8px 0; font-size: 1.6rem; }
  .summary { margin: 0; color: ${({ theme }) => theme.title.secondary}; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const Column = styled.div``;

const Section = styled.section`
  background: transparent;
  margin-bottom: 18px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  h3 { margin: 0; font-size: 1.05rem; }
  svg { color: ${({ theme }) => theme.highlight.primary}; }
`;

const Items = styled.div`
  margin-top: 10px;
`;

const Item = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  .date { color: ${({ theme }) => theme.title.secondary}; font-size: 0.85rem; }
  .company { color: ${({ theme }) => theme.title.secondary}; font-size: 0.9rem; }
`;

const ItemBody = styled.div`
  margin-top: 6px;
  .title { font-weight: 600; }
  ul { margin: 8px 0 0 18px; color: ${({ theme }) => theme.title.secondary}; }
`;

const ProjectList = styled.div`
  margin-top: 10px;
`;

const Project = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  .proj-title { display:flex; justify-content:space-between; align-items:center; }
  .proj-desc { margin: 8px 0 0 0; color: ${({ theme }) => theme.title.secondary}; }
  .tech { margin-top: 6px; font-size: 0.9rem; color: ${({ theme }) => theme.title.secondary}; }
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Skill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 6px;
  font-size: 0.9rem;
  img { width: 20px; height: auto; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: ${({ theme }) => theme.highlight.primary}; display:inline-block; }
`;

const Wrapper = styled.section`
  .card-inner { left: 560px; }
  .content.resume .row { display: flex; gap: 0; }
  .col.col-6 { width: 50%; }
  @media (max-width: 900px) { .card-inner { left: 0; } .col.col-6 { width: 100%; } }
  .cards { display:flex; align-items:center; gap:12px; }
  .card-img img { width: 28px; height: 28px; object-fit: contain; }
  .card-img .dot { width: 16px; height: 16px; border-radius: 50%; }
  .card-title .title { font-size: 0.95rem; }
  /* Ensure all resume items are visible and stacked */
  .resume-items { display: block !important; overflow: visible !important; }
  .resume-items .resume-item {
    display: block !important;
    position: relative !important;
    opacity: 1 !important;
    transform: none !important;
    margin-bottom: 20px;
  }
  .resume-title { margin-top: 20px; margin-bottom: 12px; }
  .resume-items .experience-desc ul { max-height: none !important; }
  /* Make dates bold across resume */
  .resume-items .date,
  .card-title .date {
    font-weight: 700 !important;
    color: ${({ theme }) => theme.title.primary};
  }
  /* Projects styling */
  .project-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
  /* Align project list with other resume items that use icons */
  .resume-title + .row .project-list { padding-left: 36px; }
  .project-card { background: rgba(0,0,0,0.02); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04); }
  .proj-desc ul { margin: 8px 0 0 18px; color: ${({ theme }) => theme.title.secondary}; }
  .project-card .tech { margin-top: 8px; display:flex; flex-wrap:wrap; gap:6px; }
  .project-card .tag { background: ${({ theme }) => theme.bg.secondary || '#eef'}; padding:4px 8px; border-radius:12px; font-size:0.85rem; }

  /* Skills */
  .skills { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
  .skill { display:flex; align-items:center; gap:8px; padding:6px 8px; border:1px solid rgba(0,0,0,0.06); border-radius:6px; background:transparent; }
  .skill img { width:20px; height:20px; object-fit:contain; }
  .skill .dot { width:10px; height:10px; border-radius:50%; background: ${({ theme }) => theme.highlight.primary}; display:inline-block; }
  .skill-icon { width:18px; height:18px; color: ${({ theme }) => theme.highlight.primary}; }
  .lang-icon { margin-right:8px; color: ${({ theme }) => theme.highlight.primary}; }

  /* Languages */
  .languages ul { margin: 6px 0 0 18px; color: ${({ theme }) => theme.title.secondary}; }
`;

