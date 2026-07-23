export type AppErrorKind =
  | "github-rate-limit"
  | "llm-timeout"
  | "invalid-repository"
  | "network"
  | "not-found"
  | "generic";

export type AppErrorAction = {
  label: string;
  onClick: () => void;
};

export type AppErrorPresentation = {
  kind: AppErrorKind;
  eyebrow: string;
  title: string;
  message: string;
  details?: string;
  primaryAction?: AppErrorAction;
  secondaryAction?: AppErrorAction;
};
