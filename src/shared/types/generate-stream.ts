export type GenerateThoughtEvent = {
  type: "thought";
  text: string;
};

export type GenerateDoneEvent<T> = {
  type: "done";
  plan: T;
};

export type GenerateErrorEvent = {
  type: "error";
  error: string;
  status?: number;
  code?: string;
};

export type GenerateStreamEvent<T> = GenerateThoughtEvent | GenerateDoneEvent<T> | GenerateErrorEvent;
