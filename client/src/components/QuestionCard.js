import React from 'react';

const QuestionCard = ({ question, current, total, selectedAnswer, onSelect, onNext }) => {
  return (
    <div className="card bg-dark text-white" style={{ border: '1px solid #237ac3' }}>
      <div className="card-body">
        <h5 className="card-title">Question {current + 1} of {total}</h5>
        <h3 className="mb-4">{question.question}</h3>

        <div className="options mb-4">
          {question.options.map((option, index) => (
            <div key={index} className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="quizOption"
                id={`option${index}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={() => onSelect(option)}
              />
              <label className="form-check-label" htmlFor={`option${index}`}>
                {option}
              </label>
            </div>
          ))}
        </div>

        <button 
          className="btn btn-primary"
          onClick={onNext}
          disabled={!selectedAnswer}
        >
          {current === total - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

export default QuestionCard;
