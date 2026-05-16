import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseAgentRunRequest } from './validation.ts';

describe('parseAgentRunRequest', () => {
  it('accepts plugin config records', () => {
    const request = parseAgentRunRequest({
      input: 'hello',
      pluginNames: ['echo'],
      metadata: {
        source: 'test',
      },
      pluginConfigs: {
        echo: {
          uppercase: true,
        },
      },
    });

    assert.deepEqual(request.pluginConfigs, {
      echo: {
        uppercase: true,
      },
    });
  });

  it('rejects malformed plugin configs', () => {
    assert.throws(
      () =>
        parseAgentRunRequest({
          input: 'hello',
          pluginConfigs: {
            echo: 'bad',
          },
        }),
      /pluginConfigs/,
    );
  });
});
