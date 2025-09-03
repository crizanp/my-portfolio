import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const aiTools = [
  // Easy → quick prototypes
  'Exam timer and preparation tracker',
  'Algorithm visualizer for sorting/searching',
  'Code snippet generator for multiple languages',
  'Resume analyzer & score generator',
  'Chemistry reaction balancer with UI',
  'Handwritten digit recognition web app',
  'Movie recommendation system',
  'Sentiment analysis of product reviews',
  'Sentiment analysis of global news',
  'Language translator with citation-friendly output',
  'AI-powered art generator',
  'Personal finance tracker with AI suggestions',
  'Automated plant watering system',

  // Moderate → model integration / multiple components
  'AI e-library with book recommendations',
  'Exam question generator from textbooks',
  'AI Essay Grader with plagiarism checker',
  'Speech-to-text lecture summarizer',
  'Fake news detection system',
  'Emotion detection from social media posts',
  'AI-powered academic chatbot',
  'AI-based study planner',
  'Student feedback analytics platform',
  'Student performance predictor',
  'AI job recommendation platform',
  'Collaborative project tracker for students',
  'E-commerce sales predictor',
  'Energy consumption predictor for buildings',
  'Traffic flow analyzer using ML',
  'Global climate change visualizer',
  'Smart campus mobile app',
  'Eco-friendly transport suggestion app',
  'Mental health support app',

  // Hard → hardware, real-time, privacy/regulatory concerns
  'Smart attendance system using facial recognition',
  'Object detection for lab safety',
  'Smart parking detection system',
  'Smart home automation system',
  'IoT-based air quality monitor',
  'Smart waste management system',
  'IoT campus safety alert system',
  'Wearable health monitor',
  'Voice-controlled wheelchair',
  'Virtual campus tour with AR/VR',
  'Smart tourism guide with AR',
  'Food waste reduction app connecting donors & charities',
  'Disaster response prediction system',
  'Crime data hotspot predictor',
  'Global disease outbreak predictor',
  'Medical symptom checker',
  'Blockchain-based student records storage',
  'Physics problem solver with step-by-step explanations'
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const AIModals = () => {
  useEffect(() => {
    const appRoot = document.getElementById('app-root');
    if (appRoot) appRoot.classList.add('hide-profile');
    return () => { if (appRoot) appRoot.classList.remove('hide-profile'); }
  }, []);

  return (
    <div className="content private">
      <div className="tools-header text-black">AI Tools</div>
      <div className="tools-subtitle text-gray-800">A collection of AI-powered project pages / modals. Click any item to open its page.</div>
      <div className="category-row" style={{ marginTop: 12 }}>
        {aiTools.map(tool => {
          const slug = slugify(tool);
          return (
            <Link key={tool} to={`/ai/${encodeURIComponent(slug)}`} className="tool-card">
              <div style={{ fontWeight: 600 }}>{tool}</div>
              <div className="tool-card-sub">Open page</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AIModals;
