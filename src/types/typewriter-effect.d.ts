declare module 'typewriter-effect/dist/core' {
  export default class Typewriter {
    constructor(
      element: string | HTMLElement | null,
      options?: {
        loop?: boolean;
        delay?: number | 'natural';
        deleteSpeed?: number | 'natural';
        cursor?: string;
        autoStart?: boolean;
        devMode?: boolean;
        wrapperClassName?: string;
        cursorClassName?: string;
        stringSplitter?: (text: string) => string[];
        skipAddStyles?: boolean;
      }
    );
    typeString(string: string): Typewriter;
    pasteString(string: string): Typewriter;
    deleteAll(speed?: number | 'natural'): Typewriter;
    deleteChars(amount: number): Typewriter;
    pauseFor(ms: number): Typewriter;
    start(): Typewriter;
    stop(): Typewriter;
    callFunction(
      callback: (state: {
        elements: {
          container: HTMLElement;
          wrapper: HTMLElement;
          cursor: HTMLElement;
        };
      }) => void
    ): Typewriter;
    changeDeleteSpeed(speed: number | 'natural'): Typewriter;
    changeDelay(delay: number | 'natural'): Typewriter;
  }
}

declare module 'typewriter-effect' {
  export { default } from 'typewriter-effect/dist/core';
}
