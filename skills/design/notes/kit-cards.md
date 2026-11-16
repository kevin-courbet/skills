---
id: kit-cards
topic: kit
summary: A kit card holds its content directly, splits several blocks into card sections, and never holds a second bordered box.
keywords: [card, card sections, nested card, card inside card, panel in card, card layout, flush section, inset section, framed panel, box in box]
specializes: [spacing, depth]
related: [kit-composition]
---

# Kit Cards

A card holds its content directly. Do not put a card, a framed panel, or any second bordered box inside a card. Read the components with `design docs Card` and `design docs CardSection`.

## Rules

- A card with one block of content: `<Card title="Activity">` with the content as children.
- A card with several blocks, such as facts, a status strip, a stepper, and logs: `<Card title="Pipeline" layout="sections">` with one `CardSection` for each block. Lines divide the sections. The sections have no border, radius, or surface of their own.
- Content with its own padding, such as a `StatStrip framed={false}` or a `LogViewer variant="embedded"`, goes in `CardSection padding="flush"`.
- `CardSection tone="inset"` sinks one section into the inset surface for raw output, such as a payload. It is a band across the full width, not a nested card. Do not use it for other content.
- On a page, a `Section` holds its content directly with spacing. Use a `Card` inside a `Section` only for distinct, comparable, or actionable groups, such as two cards side by side.

## Example

```tsx
<Card title="Pipeline" layout="sections" actions="Total 1m 56s">
  <CardSection>
    <Stepper mode="status" label="Pipeline stages" steps={stages} selectedStep={stage} onSelectionChange={setStage} />
  </CardSection>
  <CardSection padding="flush">
    <LogViewer variant="embedded" label="Build output" lines={lines} emptyState={empty} />
  </CardSection>
</Card>
```
