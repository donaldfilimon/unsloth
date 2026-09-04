// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

/**
 * One-way hook from a dictation adapter back into the voice conversation loop.
 *
 * The loop lives in the composer (thread.tsx) and the adapter is constructed by the
 * runtime provider, so the adapter cannot hold a React reference to it. A module-level
 * registry is also what survives the ThreadWelcome -> ThreadComposerDock remount that
 * the first send triggers, which a subscription would not.
 *
 * It lives in its own file rather than in thread.tsx so the adapter does not have to
 * import the whole composer tree to reach it -- that would be an import cycle
 * (runtime-provider -> adapter -> thread -> ... ), and bundlers resolve those by
 * handing one side a partially initialised module.
 */

let voiceResume: (() => void) | null = null;

/** Called by the mounted voice loop. Pass null on teardown. */
export function registerVoiceResume(fn: (() => void) | null): void {
  voiceResume = fn;
}

/**
 * Re-arm the mic after a recoverable end of session -- a Web Speech "no-speech"
 * timeout, say, where the engine heard nothing and gave up but the conversation is
 * still going. A no-op unless the loop is mounted and voice mode is still active, so
 * an adapter used outside voice mode can call it freely.
 */
export function requestVoiceResume(): void {
  voiceResume?.();
}
