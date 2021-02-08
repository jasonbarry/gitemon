import React, { useEffect, useState } from "react";
import { formatTime } from "./lib/utils";
import Progress from "./Progress";

import "./Game.css";
import People from "./People";

function Game({ authenticatedUser, isFetching, people }) {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSoundEnabled, toggleSound] = useState(true);
  const [score, setScore] = useState(0);

  const correctAnswersCount = correctAnswers.length;
  const hasFinished =
    people.length > 0 && correctAnswersCount === people.length;
  const isAuthenticated = Boolean(authenticatedUser);

  useEffect(() => {
    const timerId = setInterval(() => {
      if (hasFinished) {
        clearInterval(timerId);

        return;
      } else if (!isFetching) {
        setElapsedSeconds(elapsedSeconds + 1);
      }
    }, 1000);

    return () => clearInterval(timerId);
  });

  const sound1 = new Audio("/sound/partial.mp3");
  const sound2 = new Audio("/sound/full.mp3");
  const sound3 = new Audio("/sound/win.mp3");

  const handleAnswer = (event) => {
    const candidateAnswer = currentAnswer.toLowerCase();
    const { hasPlayer, indexes: newCorrectAnswers } = people.reduce(
      (result, person, index) => {
        const isMatch = person.username === candidateAnswer;

        return {
          hasPlayer:
            result.hasPlayer ||
            (isMatch && person.username === authenticatedUser),
          indexes: isMatch ? [index, ...result.indexes] : result.indexes,
        };
      },
      { hasPlayer: false, indexes: [] }
    );

    if (newCorrectAnswers.length > 0) {
      const newCorrectAnswersState = [...newCorrectAnswers, ...correctAnswers];

      setCorrectAnswers(newCorrectAnswersState);
      setScore(score + 1);

      let sound;

      if (newCorrectAnswersState.length === people.length) {
        sound = sound3;
      } else if (hasPlayer) {
        sound = sound2;
      } else {
        sound = sound1;
      }

      if (isSoundEnabled) {
        sound.play();
      }
    }

    setCurrentAnswer("");
    event.preventDefault();
  };

  return (
    <>
      <div className="controls">
        {!hasFinished && (
          <>
            <form className="form" onSubmit={handleAnswer}>
              <div className="input-wrapper">
                <input
                  className="input nes-input"
                  onChange={(event) => setCurrentAnswer(event.target.value)}
                  placeholder="Type a username"
                  value={currentAnswer}
                />

                <button
                  type="submit"
                  className="confirm-button nes-btn is-primary"
                >
                  GO
                </button>
              </div>
            </form>

            <h2>
              SCORE: {score} <i className="nes-icon coin"></i>
            </h2>
          </>
        )}
      </div>

      {hasFinished && (
        <>
          <p>
            <i className="nes-icon trophy is-large"></i>
          </p>
          <h2>Congratulations!</h2>
          <p>
            You finished in <strong>{formatTime(elapsedSeconds)}</strong> with a
            score of <strong>{score}</strong>.
          </p>
        </>
      )}

      <People correctAnswers={correctAnswers} people={people} />

      {!isFetching && !hasFinished && (
        <Progress
          correctAnswers={correctAnswers}
          elapsedSeconds={elapsedSeconds}
          isAuthenticated={isAuthenticated}
          people={people}
        />
      )}

      <div className="toggle-sound">
        <label>
          <input
            checked={isSoundEnabled}
            className="nes-checkbox"
            onChange={(event) => toggleSound(event.target.checked)}
            type="checkbox"
          />
          <span>Sound</span>
        </label>
      </div>
    </>
  );
}

export default Game;
