import assert from 'node:assert/strict';
import test from 'node:test';
import { generateStory } from '../src/services/storyGenerator.js';

for (const language of ['fr', 'en']) {
  for (const messageCount of [10, 20, 30]) {
    test(`Google Search demo returns ${messageCount} linked results in ${language}`, async () => {
      const story = await generateStory({ theme: 'google-search', provider: 'demo', language, messageCount });

      assert.equal(story.messages.length, messageCount);
      assert.equal(story.language, language);
      assert.ok(story.messages.every(message => (
        message.metadata?.googleResult?.query
        && message.metadata.googleResult.siteName
        && message.metadata.googleResult.url.startsWith('https://')
        && message.metadata.googleResult.snippet
      )));
      assert.ok(new Set(story.messages.map(message => message.metadata.googleResult.query)).size > 1);
    });
  }
}

test('Google Search demo rejects languages it cannot generate accurately', async () => {
  await assert.rejects(
    generateStory({ theme: 'google-search', provider: 'demo', language: 'it', messageCount: 10 }),
    error => error.statusCode === 400 && /français et en anglais/.test(error.message),
  );
});
