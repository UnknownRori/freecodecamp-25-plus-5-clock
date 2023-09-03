import { useEffect, useRef, useState } from "react";

import BeepSound from "../assets/beep.wav";

type Clock = {
  hours: number,
  minutes: number,
  seconds: number,
};

enum State {
  INITIAL = "INITIAL",
  BREAK = "BREAK",
  BREAK_PAUSE = "BREAK_PAUSE",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
}

/// Session in this represent of total seconds
/// Session Length is in minute format
const defaultSessionSettings = {
  session: 60 * 25,
  session_break: 5,
  session_length: 25,
}

function getClock(myTimeFormat: number): Clock {
  const hours = Math.floor(myTimeFormat / 3600);
  // const minutes = Math.floor((myTimeFormat % 3600) / 60);
  const minutes = Math.floor(myTimeFormat / 60);
  const seconds = myTimeFormat % 60;

  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
}

function prettifyClock(myTimeFormat: number) {
  const { minutes, seconds } = getClock(myTimeFormat);

  let convertedMinutes = "";
  if (minutes < 10) {
    convertedMinutes = `0${minutes.toString()}`
  } else {
    convertedMinutes = minutes.toString();
  }

  let convertedSeconds = ""
  if (seconds < 10) {
    convertedSeconds = `0${seconds.toString()}`
  } else {
    convertedSeconds = seconds.toString();
  }

  return `${convertedMinutes}:${convertedSeconds}`;
}

export default function() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<State>(State.INITIAL);
  const [isBreak, setBreak] = useState(false);

  const [session, setSession] = useState({
    ...defaultSessionSettings,
  });

  function updateSessionLength(newSessionLength: number) {
    if (newSessionLength <= 0 || newSessionLength > 60 || state == State.RUNNING) {
      return;
    }

    setSession({
      ...session,
      session: newSessionLength * 60,
      session_length: newSessionLength,
    })
  }

  function updateSessionBreak(newSessionBreak: number) {
    if (newSessionBreak <= 0 || newSessionBreak > 60 || state == State.RUNNING) {
      return;
    }

    setSession({
      ...session,
      session_break: newSessionBreak,
    });
  }

  function resetSession() {
    stopSound();
    setState(State.INITIAL);
    setBreak(false);
    setSession({
      ...defaultSessionSettings,
    })
  }

  function playSound() {
    if (audioRef.current == null) return;
    audioRef.current.play();
  }

  function stopSound() {
    if (audioRef.current == null) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  // TODO : Maybe clean up later
  useEffect(() => {
    let interval_id: number | null = null;
    if (state == State.RUNNING) {
      interval_id = setInterval(() => {
        if (session.session == 0) {
          playSound();
          setSession({
            ...session,
            session: session.session_break * 60,
          })
          setState(State.BREAK);
          setBreak(true);
        } else {
          setSession({
            ...session,
            session: session.session - 1,
          });
        }
      }, 1000);
    } else if (state == State.BREAK) {
      interval_id = setInterval(() => {
        if (session.session == 0) {
          playSound();
          setSession({
            ...session,
            session: session.session_length * 60,
          })
          setState(State.RUNNING);
          setBreak(false);
        } else {
          setSession({
            ...session,
            session: session.session - 1,
          });
        }
      }, 1000);
    }

    return () => {
      if (interval_id != null)
        clearInterval(interval_id);
    }
  }, [state, session]);

  function startStopSession() {
    if (state == State.INITIAL || state == State.PAUSED)
      setState(State.RUNNING);
    else if (state == State.RUNNING)
      setState(State.PAUSED)
    else if (state == State.BREAK)
      setState(State.BREAK_PAUSE);
  }

  return (
    <div className="flex flex-col gap-12 justify-center items-center p-2">
      <header>
        <h2 className="text-5xl font-bold">25 + 5 Clock</h2>
      </header>
      <section className="flex flex-col justify-between items-center gap-8">
        <div className="flex gap-12">
          <div className="flex flex-col justify-center items-center">
            <h3 id="break-label" className="text-2xl">Break Length</h3>
            <div className="flex flex-row justify-center items-center gap-2">
              <button id="break-decrement" onClick={() => updateSessionBreak(session.session_break - 1)}>
                <svg className="h-8 w-8 text-blue-700" width="24" height="24"
                  viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                  fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="18" y1="13" x2="12" y2="19" />  <line x1="6" y1="13" x2="12" y2="19" /></svg>
              </button>
              <p id="break-length" className="text-3xl font-bold">
                {session.session_break}
              </p>
              <button id="break-increment" onClick={() => updateSessionBreak(session.session_break + 1)}>
                <svg className="h-8 w-8 text-blue-700" width="24" height="24"
                  viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                  stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1="12" y1="5" x2="12" y2="19" />  <line x1="18" y1="11" x2="12" y2="5" />
                  <line x1="6" y1="11" x2="12" y2="5" /></svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <h3 id="session-label" className="text-2xl">Session Length</h3>
            <div className="flex flex-row justify-center items-center gap-2">
              <button id="session-decrement" onClick={() => updateSessionLength(session.session_length - 1)}>
                <svg className="h-8 w-8 text-blue-700" width="24" height="24"
                  viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                  fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" />  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="18" y1="13" x2="12" y2="19" />  <line x1="6" y1="13" x2="12" y2="19" /></svg>
              </button>
              <p id="session-length" className="text-3xl font-bold">
                {session.session_length}
              </p>
              <button id="session-increment" onClick={() => updateSessionLength(session.session_length + 1)}>
                <svg className="h-8 w-8 text-blue-700" width="24" height="24"
                  viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                  stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1="12" y1="5" x2="12" y2="19" />  <line x1="18" y1="11" x2="12" y2="5" />
                  <line x1="6" y1="11" x2="12" y2="5" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center items-center border-gray-200 border-2 px-24 py-4 shadow rounded">
          <h3 id="timer-label" className="text-2xl">{isBreak ? "Break" : "Session"}</h3>
          <span id="time-left" className="text-4xl font-bold">{prettifyClock(session.session)}</span>
          <audio ref={audioRef} src={BeepSound} id="beep"></audio>
          <div className="flex gap-4">
            <button id="start_stop" onClick={() => startStopSession()}>
              <svg className="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" /></svg>
            </button>
            {/*
                        <button id="pause">
                          <svg className="h-8 w-8 text-blue-700" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="6" y="4" width="4" height="16" />  <rect x="14" y="4" width="4" height="16" /></svg>
                        </button>
                        */}
            <button id="reset" onClick={() => resetSession()}>
              <svg className="h-8 w-8 text-blue-700" width="24" height="24" viewBox="0 0 24 24"
                stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" />  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
