# Design Guidelines

Telegram apps are expected to feel fast, smooth, and consistent across platforms. This Mini App should follow those expectations while also supporting the specific UX needs of an idle game: short sessions, clear progression, readable numbers, low interaction cost, and predictable feedback.

## Core Principles

- Design mobile-first. Start from a `320px` wide viewport and scale up.
- Prioritize one-handed use. The most frequent actions should stay in the lower half of the screen.
- Make the main game loop understandable at a glance: current progress, current reward, current risk, next meaningful action.
- Keep navigation shallow. A user should rarely need more than 1-2 taps to move between the main gameplay screens.
- Favor clarity over decoration. In idle games, numbers, state changes, and rewards are more important than ornamental UI.
- Preserve continuity. The UI should always make it obvious whether the player is in a run, between fights, in a reward state, or in meta-progression.

## Responsive Layout Rules

- Use a single-column layout on phones by default.
- Keep the primary content within a centered container, typically `max-width: 480px` to `560px`.
- Use consistent horizontal padding, usually `16px` on compact phones and `20px` to `24px` on larger devices.
- Use vertical stacking with clear section spacing instead of dense side-by-side layouts.
- Avoid placing two equally important CTAs on the same horizontal row on narrow screens.
- Prefer cards, panels, and stacked sections over complex grids.
- If a two-column layout is needed on larger screens, reserve it for non-critical secondary content.

## Safe Area And Viewport

- Respect the safe area in all fullscreen and near-fullscreen layouts.
- Use `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)` where appropriate.
- Add bottom padding for sticky action bars so actions never collide with Telegram controls or device home indicators.
- Prefer modern viewport units such as `dvh` for full-height layouts to reduce jumpiness when browser chrome changes.
- Do not pin critical controls to the exact screen edge.

## Information Hierarchy For Idle Games

Every important game screen should follow a clear hierarchy:

1. Persistent status: gold, health, progression, run state, and other always-relevant resources.
2. Primary focus: current battle, current upgrade decision, current result, or current reward.
3. Secondary detail: combat log, descriptions, item flavor, extra stats, and historical context.
4. Deep detail: advanced stats, long logs, help text, or expandable explanations.

Additional rules:

- Show the most important progression numbers above the fold.
- Keep permanent progression and run-only progression visually separated.
- If the game auto-advances, the player must still understand what changed after each step.
- Long logs should never push the main CTA off-screen during critical decision moments.

## Recommended Screen Structure

### Start Or Home Screen

- Show the current account-level progression immediately.
- Present one dominant action such as `Start Run`.
- Surface a compact summary of upgrades, recent progress, or offline gains.
- Keep pre-run setup lightweight. Idle games should not feel blocked by configuration.

### Battle Or Run Screen

- Keep hero state and enemy state visible without scrolling.
- Show the battle outcome trajectory clearly: HP, status, round progression, and likely next action.
- The combat log should be readable but secondary to the battle summary.
- Between-fight decisions should be simple, high-contrast, and vertically stacked.
- Avoid making the player scan multiple distant areas of the screen to understand risk.

### Shop Or Upgrade Screen

- Separate permanent upgrades, consumables, and temporary run effects into distinct sections.
- Each upgrade card should answer three questions immediately: what it changes, current level, and cost.
- Disabled purchase states must explain why the action is unavailable, for example not enough gold or max level reached.
- Highlight the best next purchase only if the recommendation is defensible and not misleading.
- Keep price, affordability, and current currency visible while scrolling.

### Results Or Reward Screen

- Summarize the run in a few key metrics first.
- Show gain and loss explicitly, including penalties, bonuses, and net reward.
- The next action should be obvious: continue progression, return to shop, or start a new run.
- Use celebration carefully. Reward screens should feel satisfying without delaying the next loop.

## Navigation And Flow

- Keep the app flow predictable: start, run, result, upgrade, repeat.
- Back navigation must not silently destroy progress.
- If leaving a run has consequences, communicate them before the user confirms.
- Use route transitions sparingly and keep them fast.
- Avoid hidden gestures for critical actions.
- Keep modal usage limited to confirmations, rewards, or short-lived decisions.

## Touch UX

- All interactive elements should have a target size of at least `44x44px`; `48x48px` is preferred for primary actions.
- Maintain enough spacing between buttons to prevent accidental taps.
- Use one clear primary CTA per section.
- Destructive or risky actions should never visually compete with the safest action.
- Prefer bottom-anchored action groups for frequent interactions.
- Do not rely on hover states as a primary affordance.

## Typography And Readability

- Use a clear type scale with strong distinction between headline, section label, stat value, and helper text.
- Important numeric values should be larger and visually stable.
- Consider tabular numerals for gold, damage, HP, timers, and counters to reduce visual jitter.
- Avoid long centered paragraphs on mobile screens.
- Maintain comfortable line height for logs and descriptions.
- Keep labels short. If a mechanic needs explanation, place it in secondary helper text.

## Spacing And Visual Rhythm

- Use a consistent spacing system, such as an `8px` base scale.
- Group related elements tightly and separate unrelated sections more clearly.
- Let primary cards breathe. Dense idle UIs feel cheaper and harder to scan.
- Keep screen sections visually chunked: header, core content, action area, secondary detail.

## Component Behavior

- Interactive elements should mimic the style, behavior, and intent of existing Telegram-like components.
- Buttons should visibly respond to press, disabled, loading, and success states.
- Cards should communicate whether they are static, selectable, expandable, or purchasable.
- Progress bars, counters, and stat chips should update smoothly without layout shifts.
- Inputs and images should contain labels for accessibility purposes.

## Motion And Animation

- All included animations should be smooth, ideally `60fps`.
- Animate with purpose: state change, feedback, reward, focus shift, or progression reveal.
- Prefer `transform` and `opacity` animations over layout-affecting properties.
- Use short durations for interaction feedback, typically `120ms` to `220ms`.
- Use slightly longer durations for screen-state transitions, typically `200ms` to `350ms`.
- Avoid large parallax, particle spam, or constant ambient motion in core gameplay flows.
- Combat replay should feel readable first and dramatic second.
- Respect `prefers-reduced-motion` where feasible.

## Performance Guidelines

- The interface should feel instant on open, resume, and tap.
- For Android devices, consider the additional information in the User-Agent and adjust for the device’s performance class, minimizing animations and visual effects on low-performance devices.
- Degrade gracefully on low-end devices by reducing blur, shadows, layered gradients, animation count, and repaint-heavy effects.
- Lazy-load non-critical images and secondary assets.
- Avoid large image payloads in above-the-fold UI.
- Do not run unnecessary timers, polling, or animations while the screen is backgrounded.
- Prevent layout shift when numbers, logs, or rewards update.

## Theme Integration

- The app should deliver a seamless experience by monitoring the dynamic theme-based colors provided by the API and using them accordingly.
- Map Telegram theme values into local semantic tokens such as `surface`, `surface-muted`, `text-primary`, `text-secondary`, `cta`, `cta-text`, and `danger`.
- Always define safe fallbacks for missing optional theme values.
- Do not hardcode light-only or dark-only assumptions.
- Validate contrast in both light and dark Telegram themes, especially for helper text and subtle dividers.

## Accessibility

- Support keyboard focus states even if most users are on touch devices.
- Ensure visible focus styling on all controls.
- Maintain sufficient contrast for text, icons, progress indicators, and disabled states.
- Do not encode critical meaning by color alone; pair color with text, iconography, or shape.
- Announce major state changes in an accessible way when possible, such as rewards gained or battle ended.
- Avoid fixed-height containers for text that may wrap due to localization or accessibility zoom.

## States And Feedback

Design every major screen for these states:

- loading
- ready
- empty
- disabled
- success
- error
- reconnect or retry
- offline or resumed session

Additional rules:

- Show immediate feedback after every important tap.
- Make purchase failures explicit.
- If data is recalculated or synced, avoid flashing or resetting the whole screen.
- Reward collection, currency changes, and progression jumps should feel noticeable but not obstructive.

## Idle-Specific UX Best Practices

- The player should never wonder whether the game is progressing, paused, or waiting for input.
- Use clear timestamps or labels for offline progress, accumulated rewards, and resumed sessions.
- Distinguish automatic outcomes from player-triggered outcomes.
- Surface the next meaningful decision quickly after automation finishes.
- Keep repeat actions low-friction. Restarting a run or claiming a reward should not require excessive confirmation.
- When showing long-term progression, emphasize delta values such as `+12 gold`, `+1 level`, or `-20% penalty`.
- Make risk legible. If advancing can reduce rewards or cause loss, communicate that before the tap.

## Implementation Notes

- Build layouts with mobile-first CSS and scale upward via min-width breakpoints.
- Prefer sticky bottom action areas for high-frequency actions.
- Use expandable panels or tabs for advanced stats instead of exposing everything at once.
- Keep scroll containers intentional. Nested scroll areas should be avoided unless there is a strong reason.
- Test common mobile widths including `320px`, `360px`, `390px`, `412px`, and small landscape layouts.
- Verify the UI with long translated labels and large numeric values.

## ThemeParams

Mini Apps can [adjust the appearance](https://core.telegram.org/bots/webapps#color-schemes) of the interface to match the Telegram user's app in real time. This object contains the user's current theme settings:

| Field | Type | Description |
| --- | --- | --- |
| bg_color | String | _Optional_. Background color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-bg-color)`. |
| text_color | String | _Optional_. Main text color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-text-color)`. |
| hint_color | String | _Optional_. Hint text color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-hint-color)`. |
| link_color | String | _Optional_. Link color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-link-color)`. |
| button_color | String | _Optional_. Button color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-button-color)`. |
| button_text_color | String | _Optional_. Button text color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-button-text-color)`. |
| secondary_bg_color | String | _Optional_. Bot API 6.1+. Secondary background color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-secondary-bg-color)`. |
| header_bg_color | String | _Optional_. Bot API 7.0+. Header background color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-header-bg-color)`. |
| bottom_bar_bg_color | String | _Optional_. Bot API 7.10+. Bottom background color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-bottom-bar-bg-color)`. |
| accent_text_color | String | _Optional_. Bot API 7.0+. Accent text color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-accent-text-color)`. |
| section_bg_color | String | _Optional_. Bot API 7.0+. Background color for the section in the `#RRGGBB` format. It is recommended to use this in conjunction with `secondary_bg_color`. Also available as the CSS variable `var(--tg-theme-section-bg-color)`. |
| section_header_text_color | String | _Optional_. Bot API 7.0+. Header text color for the section in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-section-header-text-color)`. |
| section_separator_color | String | _Optional_. Bot API 7.6+. Section separator color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-section-separator-color)`. |
| subtitle_text_color | String | _Optional_. Bot API 7.0+. Subtitle text color in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-subtitle-text-color)`. |
| destructive_text_color | String | _Optional_. Bot API 7.0+. Text color for destructive actions in the `#RRGGBB` format. Also available as the CSS variable `var(--tg-theme-destructive-text-color)`. |
