import React, { useState, useEffect } from 'react';
import './App.css';

// Hardcoded questions
const questions = [
  { id: 1, type: 'rating', question: 'How satisfied are you with our products?', scale: 5 },
  { id: 2, type: 'rating', question: 'How fair are the prices compared to similar retailers?', scale: 5 },
  { id: 3, type: 'rating', question: 'How satisfied are you with the value for money of your purchase?', scale: 5 },
  { id: 4, type: 'rating', question: 'On a scale of 1-10 how would you recommend us to your friends and family?', scale: 10 },
  { id: 5, type: 'text', question: 'What could we do to improve our service?' }
];

// Generate a unique customer session ID
const generateSessionId = () => `session-${new Date().getTime()}`;

const App = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Start from 0 (welcome screen)
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // To handle confirmation dialog

  // Load session data or create new session
  useEffect(() => {
    let storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem('sessionId', storedSessionId);
    }
    setSessionId(storedSessionId);

    const storedAnswers = JSON.parse(localStorage.getItem(storedSessionId)) || {};
    setAnswers(storedAnswers);
    const completionStatus = localStorage.getItem(`${storedSessionId}-status`);
    setIsCompleted(completionStatus === 'COMPLETED');
  }, []);

  // Handle answer selection or input
  const handleAnswer = (value) => {
    const updatedAnswers = { ...answers, [questions[currentQuestionIndex - 1].id]: value }; // index starts from 1st question at index 1
    setAnswers(updatedAnswers);
    localStorage.setItem(sessionId, JSON.stringify(updatedAnswers));
  };

  // Navigation functions
  const goNext = () => {
    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentQuestionIndex > 1) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Show confirmation dialog for submitting survey
  const confirmSubmit = () => {
    setShowConfirmation(true);
  };

  // Handle final survey submission after confirmation
  const submitSurvey = () => {
    localStorage.setItem(`${sessionId}-status`, 'COMPLETED');
    setIsCompleted(true);
    setShowThankYou(true);
    setShowConfirmation(false); // Close confirmation dialog

    setTimeout(() => {
      setShowThankYou(false);
      setCurrentQuestionIndex(0);
      localStorage.removeItem('sessionId');
    }, 5000); // Show thank you screen for 5 seconds
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  if (showThankYou) {
    return <div className="thank-you">Thank you for your time!</div>;
  }

  if (!sessionId) {
    return <div>Loading...</div>;
  }

  // if (isCompleted) {
  //   return (
  //     <div className="completed-survey">
  //       <p>You have already completed this survey. Thank you!</p>
  //     </div>
  //   );
  // }

  // Handle the Welcome screen
  if (currentQuestionIndex === 0) {
    return (
      <div className="welcome-screen">
        <h1>Welcome to the Customer Survey</h1>
        <button onClick={goNext}>Start Survey</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex - 1]; // Adjusting for the fact that index 0 is the welcome screen
  const totalQuestions = questions.length;

  return (
    <div className="survey-container">
      <h2>Question {currentQuestionIndex}/{totalQuestions}</h2>
      <p>{currentQuestion.question}</p>

      {currentQuestion.type === 'rating' && (
        <div className="rating-options">
          {Array.from({ length: currentQuestion.scale }, (_, i) => (
            <button
              key={i + 1}
              className={answers[currentQuestion.id] === i + 1 ? 'selected' : ''}
              onClick={() => handleAnswer(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {currentQuestion.type === 'text' && (
        <textarea
          value={answers[currentQuestion.id] || ''}
          onChange={(e) => handleAnswer(e.target.value)}
          placeholder="Your feedback..."
        />
      )}

      <div className="navigation-buttons">
        <button onClick={goPrevious} disabled={currentQuestionIndex === 1}>Previous</button>
        {currentQuestionIndex < totalQuestions ? (
          <button onClick={goNext}>Next</button>
        ) : (
          <button onClick={confirmSubmit}>Submit</button>
        )}
        <button onClick={goNext}>Skip</button>
      </div>

      {/* Confirmation dialog for submitting the survey */}
      {showConfirmation && (
        <div className="confirmation-dialog">
          <p>Are you sure you want to submit the survey?</p>
          <button onClick={submitSurvey}>Yes</button>
          <button onClick={cancelSubmit}>No</button>
        </div>
      )}
    </div>
  );
};

export default App;