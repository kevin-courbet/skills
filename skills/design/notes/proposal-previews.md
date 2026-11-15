---
id: proposal-previews
topic: process
summary: Show a design proposal or a UX change before implementation as a running preview of the real application components, operate the journey with the user, and integrate only after approval.
keywords: [design proposal, propose a design, component preview, preview, ux proposal, user journey, workflow change, compare states, mockup, prototype, ladle, storybook, sandbox, design review before implementation, approval, interactive preview]
related: [preview-server, review, project-context, method]
---

# Proposal Previews

Use a running preview as the default medium to discuss a user experience, a user journey, or a component design. The user operates the real controls and approves the change before you integrate it. This note is for proposals before implementation. [[review]] is the checklist for finished work.

## Establish The Task

1. Read the repository instructions, `DESIGN.md`, and the related domain documentation. [[project-context]] gives the file.
2. Identify the user task, the important states, the available actions, and the completion criteria.
3. Inspect the current components, schemas, workflows, and validation rules.
4. Keep the existing categories, constraints, financial rules, and permissions.
5. Identify the proposed behavior changes that need approval.
6. Ask about open product decisions before you implement them.

Do not invent free input where the application already defines a controlled set of choices. Explain the current behavior and the proposed change separately.

## Select The Preview

1. Use an existing component preview or sandbox when it supports the task.
2. For React, prefer Ladle. It gives scenario navigation, direct links, and component isolation.
3. When the preview tool blocks the journey or is too slow, use a small HTML or Vite harness.
4. Import the real components with their normal styles, fonts, themes, and providers.
5. Keep the proposed composition code out of production routes until approval.
6. Isolate fictional data and simulated responses at the data boundary.
7. Say which components exist and which composition or components the proposal adds.

- An HTML harness must mount the real components. A visual copy of the interface is not component reuse.
- Disable real provider calls and production writes in the preview.
- Simulated responses prove only the preview behavior. They do not prove that the backend is correct.
- Use a dedicated Vite configuration for the preview. Keep the server plugins and the credentials of the application out of it.
- Connect the theme switcher of the preview to the light and dark styles of the application, also for portaled components. Keep theme changes in the preview separate from the saved preferences of the application.

[[preview-server]] gives the rules for speed and for the development loop.

## Make The Journey Operable

1. Give direct links to the important start states.
2. Include the main journey and the important alternative paths.
3. Include the validation, pending, error, retry, cancel, and undo states that the workflow needs.
4. Keep the user input after a failed operation.
5. Update derived summaries at once from the current selection.
6. Keep confirmed results and pending changes separate in the state model.
7. Show pending feedback in the current visual system.
8. Keep the controls that simulate the server separate from the proposed controls for the customer.
9. Give a reset for each scenario that people can repeat.

Write short, natural copy. Do not explain clear controls or visible state changes. [[ux-writing]] gives the rules. Apply the accessibility rules to the real component tree.

## Validate And Collect Feedback

1. Load [[skill:agent-browser]] before browser automation.
2. Take a new snapshot before each action.
3. Clear the error buffer before a behavior check.
4. Operate the controls through semantic targets.
5. Check the balances, summaries, selected states, and navigation results that the change affects.
6. Check the affected dialogs for horizontal overflow.
7. Check the desktop layout and the narrow-screen layout.
8. Use screenshots for the visual review and browser behavior as the evidence for interaction.
9. Keep temporary smoke checks out of the committed tests.
10. Give the user the working link and short review instructions.
11. Apply the feedback of the user to the same preview.
12. Get explicit approval before you integrate the proposed product behavior.

## Hand Off

1. Record the user decisions that last, with the decision-record convention of the repository.
2. Integrate the approved components and update all callers.
3. Validate the real application workflow separately from the simulated preview.
4. Report the validation evidence and each remaining gap.
5. Track the server processes and the containers that the session starts.
6. Keep the preview available for the review period that the user asks for.
7. Obey the session-close policy when the review ends.

## Related Skills

- Use [[skill:react-best-practices]] for React code.
- Use [[skill:red-green-refactor]] to prove the behavior.
- Load domain skills when the journey depends on accounting, monetary calculations, application data, or another specialized contract.
