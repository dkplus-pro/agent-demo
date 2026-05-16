import type { AgentRunRequest, AgentRunResponse, AgentTraceEvent } from '@ai-mind-clone/shared/generated/openapi';

type AgentStreamHandlers = {
  onEvent: (event: AgentTraceEvent) => void;
  onResult: (result: AgentRunResponse) => void;
  onError: (message: string) => void;
};

export async function streamAgentRun(request: AgentRunRequest, handlers: AgentStreamHandlers) {
  const response = await fetch('/api/agent/runs/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Agent stream failed with ${response.status}.`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    for (const chunk of chunks) {
      handleSseChunk(chunk, handlers);
    }
  }

  if (buffer.trim()) {
    handleSseChunk(buffer, handlers);
  }
}

function handleSseChunk(chunk: string, handlers: AgentStreamHandlers) {
  const event = chunk
    .split('\n')
    .find((line) => line.startsWith('event: '))
    ?.slice('event: '.length);
  const data = chunk
    .split('\n')
    .find((line) => line.startsWith('data: '))
    ?.slice('data: '.length);

  if (!event || !data) {
    return;
  }

  const payload = JSON.parse(data) as unknown;

  if (event === 'agent.event') {
    handlers.onEvent(payload as AgentTraceEvent);
  }

  if (event === 'agent.result') {
    handlers.onResult(payload as AgentRunResponse);
  }

  if (event === 'agent.error') {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload ? String(payload.message) : 'Agent stream failed.';

    handlers.onError(message);
  }
}
