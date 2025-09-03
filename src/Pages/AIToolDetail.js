import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const slugToTitle = (slug) => {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const AIToolDetail = () => {
    const { id } = useParams();
    const title = slugToTitle(id || '');

    useEffect(() => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.add('hide-profile');
        return () => { if (appRoot) appRoot.classList.remove('hide-profile'); }
    }, []);

    return (
        <div className="content private">
            <div className="tools-header text-black">{title}</div>
            <div style={{ marginTop: 12 }}>
                <p>The page is under construction We are building something interesting</p>
                <p>
                    Quick actions:
                </p>
                <ul>
                    <li><Link to="/ai">Back to AI tools</Link></li>
                    <li><Link to="/tools">View general tools</Link></li>
                </ul>
            </div>
        </div>
    );
}

export default AIToolDetail;
