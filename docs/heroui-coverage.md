# HeroUI Coverage

This file records how the kit of the `internal-app` skill covers the
components of HeroUI v3 (https://heroui.com, `@heroui/react` 3.2.7, Apache
License 2.0, commit 301d65909379d4634d05355dcea6f71d21a0429f). Only the
open-source package was used. No HeroUI Pro component was used.

This file is for the maintainers of the kit. It does not ship with the skill.
The kit files that it names are in
`skills/design/assets/kit/src/components/`. The rules for app
builders about the skipped controls are in the "Controls The Kit Leaves Out"
section of `skills/design/notes/kit-adding-a-component.md`.

The test for each item is the same as in `reui-coverage.md`: does an internal
tool (an operations console, an admin, a back office, or a data app)
plausibly use it? Ported items are re-implemented with StyleX, the kit tokens,
react-aria-components, and lucide, and they use the kit look.
`skills/design/THIRD_PARTY_NOTICES.md` lists every kit file that uses
HeroUI behavior or design, and it includes the Apache License 2.0 text.

Decisions:

- **Covered**: an existing kit component does the job. No HeroUI port was needed.
- **Ported**: the kit file re-implements the HeroUI component.
- **Skipped**: the kit leaves it out for the reason given.

## HeroUI Components

The rows follow the folders of `packages/react/src/components/`. A row names
more than one folder when the folders are the parts of one component.

| HeroUI | Decision | Kit file | Reason |
|---|---|---|---|
| Accordion, Disclosure, Disclosure Group | Covered | `disclosure.tsx` (`Disclosure`, `Accordion`) | Sections that open and close. |
| Alert | Covered | `alert.tsx` | Page and object notices. |
| Alert Dialog | Covered | `confirm-dialog.tsx` | Confirmation of a destructive or final action. |
| Autocomplete, Combo Box | Covered | `combo-box.tsx`, `command-palette.tsx` | `ComboBox` filters long lists; the command palette searches pages and actions. |
| Avatar, Avatar Group | Covered | `avatar.tsx` (`Avatar`, `AvatarGroup`) | People and teams. The port added the `label` prop, so that `Indicator` can name the avatar. |
| Badge | Ported | `indicator.tsx` | A dot or a count on the corner of an avatar, an icon button, or an icon. The marked element gets the accessible name through a render prop, and `meaning` is required. A status that stands alone stays a kit `Badge`. |
| Breadcrumbs | Covered | `breadcrumbs.tsx`, `route-breadcrumbs.tsx` | The page path. |
| Button, Button Group, Close Button | Covered | `button.tsx` (`Button`, `LinkButton`, `ButtonGroup`) | Actions. Dialogs, sheets, and alerts have their own close button. |
| Calendar, Range Calendar, Calendar Year Picker | Ported | `calendar.tsx` (`Calendar`, `RangeCalendar`), `helpers/calendar-parts.tsx` | Calendars on a page, such as an availability panel. The month and year jump is in the shared helper, so `DatePicker` and `DateRangePicker` have it too. The reason for an unavailable day shows in a status line, not in a tooltip, so keyboard users get it. |
| Card, Surface | Covered | `layout.tsx` (`Card`, `CardSection`), `surface-button.tsx` | Content groups, and a card that people press. |
| Checkbox, Checkbox Group | Covered | `checkbox.tsx` (`Checkbox`, `CheckboxGroup`) | Choices that people can combine. |
| Chip, Tag, Tag Group | Covered | `badge.tsx`, `tag-group.tsx` | Status labels, and tags that people select or remove. `TagGroup` tags can show a category color with `ColorSwatch`. |
| Color Swatch, Color Swatch Picker | Ported | `color-swatch.tsx` (`ColorSwatch`, `ColorSwatchPicker`) | The color of a category, such as a project or a team, from the category palette in `src/styles/category.ts`. The app stores the key of the palette color, never a hex value, so the color follows the theme. The picker is a radio group, because the react-aria color parser cannot read the `light-dark()` colors of the theme. |
| Color Area, Color Field, Color Input Group, Color Picker, Color Slider | Skipped | — | A free color in app data breaks the token rule. People pick a palette key with `ColorSwatchPicker`. |
| Date Field, Date Input Group, Date Picker, Date Range Picker | Covered | `date-picker.tsx`, `date-range-picker.tsx`, `filters.tsx` | Dates, ranges with presets, and date filters. A date field without a calendar is not necessary: the pickers accept typed dates. |
| Description, Error Message, Field Error, Fieldset, Form, Header, Label | Covered | `helpers/field.tsx`, `helpers/form.ts`, `form-layout.tsx` | The parts of a form field, form sections, the error summary, and the form footer. |
| Drawer, Sheet | Covered | `sheet.tsx` | Side and bottom panels. |
| Dropdown, Menu, Menu Item, Menu Section | Covered | `menu.tsx` | Action menus with icons, avatars, sections, and selection. |
| Empty State, Skeleton, Spinner | Covered | `feedback.tsx` (`EmptyState`, `Skeleton`, `Spinner`) | Empty, loading, and error states. |
| Input, Input Group, Text Field, Textarea | Covered | `text-field.tsx` | Text input of one line or several lines, with a prefix and a suffix. |
| Input OTP | Skipped | — | Internal apps sign in through single sign-on. |
| Kbd | Covered | `layout.tsx` (`Kbd`) | Keyboard shortcuts. |
| Link | Ported | `text-link.tsx` | A link in running text, in a `DescriptionList` value, or in a table cell, with a typed router destination or an external `href`. An external link always opens in a new tab, with an icon and a text for screen readers. `LinkButton` stays the link that looks like a button. |
| List Box, List Box Item, List Box Section | Covered | `helpers/list-box.tsx` | The option list in the popovers of `Select`, `MultiSelect`, `ComboBox`, and `Filters`. |
| Meter | Covered | `meter.tsx` | A value in a known range, such as storage use. |
| Modal | Covered | `dialog.tsx` | Dialogs. |
| Number Field | Covered | `number-field.tsx` | Numbers with steppers and units. |
| Pagination | Covered | `pagination.tsx` | Pages of a list. |
| Popover | Covered | `popover.tsx`, `hover-card.tsx` | Popovers and previews on hover. |
| Progress Bar | Covered | `progress-bar.tsx` | The progress of a task in a row or a panel. |
| Progress Circle | Ported | `progress-circle.tsx` | The progress of a task where a bar does not fit, such as a table cell or an upload item. The ring always uses the accent color. Under reduced motion, the indeterminate ring turns more slowly and does not stop. |
| Radio, Radio Group | Covered | `radio-group.tsx` | One choice from a short list. |
| Scroll Shadow | Ported | `scroll-shadow.tsx` | Edge fades on native scroll areas. `Tabs`, `Sheet`, `Dialog`, `Scrollspy`, and `Table` use it. A named area takes focus only while it overflows, and its focus ring stays inside it. |
| Search Field | Covered | `search-field.tsx` | Search in a list or a page. |
| Select | Covered | `select.tsx`, `multi-select.tsx` | One or more choices from a list. Options can show a category color with `ColorSwatch`. |
| Separator | Covered | `layout.tsx` (`Separator`) | Dividers. |
| Slider | Covered | `slider.tsx` | A value or a range on a scale. |
| Switch, Switch Group | Covered | `switch.tsx`, `layout.tsx` (`SettingsCard`, `SettingRow`) | Settings that apply at once. A group of switches is a settings card. |
| Table | Ported | `table.tsx` | A small read-only table, such as the parts of an estimate with a total row. It has no sorting, selection, or row actions. Records that people sort, filter, page, and select use `DataTable`. |
| Tabs | Covered | `tabs.tsx` | Views of one object. |
| Time Field | Covered | `time-field.tsx` | Times of day. |
| Toast | Covered | `toaster.tsx` | Results of actions. |
| Toggle Button | Ported | `toggle-button.tsx` | One button with a pressed state, such as "Wrap" in a toolbar. A pressed text button without an icon shows a check mark, so the state does not depend on color only. `ToggleGroup` and the wrap toggle of `CodeBlock` are built on it. |
| Toggle Button Group | Covered | `toggle-group.tsx`, `segmented-control.tsx` | A set of options, and a switch between views. |
| Toolbar | Covered | `layout.tsx` (`Toolbar`) | Actions above a list or an editor. |
| Tooltip | Covered | `tooltip.tsx` | Names of icon buttons and short hints. |
| Typography | Covered | `src/styles/tokens.stylex.ts`, `layout.tsx` (`PageHeader`, `Section`, `Code`) | Text styles come from the tokens and the layout components. |
| RAC, icons | Not a component | — | `rac` holds the react-aria-components glue of HeroUI, and `icons.tsx` holds its icons. The kit uses `src/lib/rac.ts` and lucide. |
