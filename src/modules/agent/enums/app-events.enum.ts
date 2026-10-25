export enum AppEvent {
  // Backend events
  AGENT_RUN_REQUESTED = 'agent.run.requested',
  AGENT_RESUME_REQUESTED = 'agent.resume.requested',

  // Events forwarded to SSE clients
  AGENT_EVENT = 'agent.event',
}
