import React from "react";
import { Link } from "react-router-dom";

const QuizSelection = ({ 
    title, 
    description, 
    comment1, 
    comment2, 
    comment3, 
    type 
}) => {

    const cardStyle = {
        backgroundColor: '#2a2a2a',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '400px',
        minWidth: '300px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    };

    const cardTitleStyle = {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#ffffff',
    };

    const cardTextStyle = {
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: '1.5rem',
    };

    const listStyle = {
        listStyle: 'none',
        padding: 0,
        marginBottom: '1.5rem',
        color: '#ffffff',
    };

    const listItemStyle = {
        marginBottom: '0.5rem',
        paddingLeft: '1.5rem',
        position: 'relative',
    };

    const aiButtonStyle = {
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '0.25rem',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        width: '100%',
        textDecoration: 'none',
        display: 'block',
        textAlign: 'center',
        transition: 'transform 0.3s ease',
    };

    const triviaButtonStyle = {
        ...aiButtonStyle,
        backgroundColor: '#28a745',
    };

    // Decide Link based on type
    const linkProps = type === 'ai'
        ? { to: '/quiz-generator/ai', style: aiButtonStyle, text: 'Use AI Generator' }
        : { to: '/quiz-generator/trivia', style: triviaButtonStyle, text: 'Use Trivia Database' };

    return (
        <div style={cardStyle}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}>
            <h2 style={cardTitleStyle}>{title}</h2>
            <p style={cardTextStyle}>{description}</p>
            <ul style={listStyle}>
                <li style={listItemStyle}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span> {comment1}</li>
                <li style={listItemStyle}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span> {comment2}</li>
                <li style={listItemStyle}>
                    <span style={{ position: 'absolute', left: 0 }}>✓</span> {comment3}</li>
            </ul>

            <Link
                to={linkProps.to}
                style={linkProps.style}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {linkProps.text}
            </Link>
        </div>
    );
};

export default QuizSelection;
