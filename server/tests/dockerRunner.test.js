import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DockerRunner } from '../services/codeExecution/DockerRunner.js';

describe('DockerRunner', () => {
  it('should format volume paths properly for Docker mount', () => {
    const runner = new DockerRunner();
    const winPath = 'D:\\Projects\\SkillSwap\\temp\\exec-123';
    const formatted = runner.formatVolumePath(winPath);
    assert.equal(formatted.includes('\\'), false);
    assert.equal(formatted, 'D:/Projects/SkillSwap/temp/exec-123');
  });

  it('should enforce concurrency limits and slot release', async () => {
    const runner = new DockerRunner({ maxConcurrentExecutions: 2 });
    assert.equal(runner.activeExecutions, 0);

    await runner.acquireSlot();
    assert.equal(runner.activeExecutions, 1);

    await runner.acquireSlot();
    assert.equal(runner.activeExecutions, 2);

    let queuedResolved = false;
    const queuedPromise = runner.acquireSlot().then(() => {
      queuedResolved = true;
    });

    assert.equal(queuedResolved, false);
    assert.equal(runner.waitQueue.length, 1);

    runner.releaseSlot();
    await queuedPromise;
    assert.equal(queuedResolved, true);

    runner.releaseSlot();
    assert.equal(runner.activeExecutions, 1);

    runner.releaseSlot();
    assert.equal(runner.activeExecutions, 0);
  });

  it('should reject when execution wait queue exceeds limit', async () => {
    const runner = new DockerRunner({ maxConcurrentExecutions: 1 });
    await runner.acquireSlot();

    // Fill queue up to 20
    for (let i = 0; i < 20; i++) {
      runner.waitQueue.push(() => {});
    }

    await assert.rejects(
      async () => await runner.acquireSlot(),
      /queue is full/
    );
  });

  it('should handle unavailable Docker daemon gracefully', async () => {
    const runner = new DockerRunner({ dockerCmd: 'non_existent_docker_binary_xyz' });
    const status = await runner.checkDockerAvailable();
    assert.equal(status.available, false);
    assert.ok(status.error.includes('not installed') || status.error.includes('unreachable'));
  });
});
