# Agent Skills

Standalone agent skills published for use with the `skills` CLI.

## Frontend Design

Load the skill for one session:

```sh
npx skills use kevin-courbet/skills@frontend-design
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill frontend-design -y
```

## Design

Load the design system hub for one session:

```sh
npx skills use kevin-courbet/skills@design
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill design -y
```

The skill has a CLI that searches and reads its design notes:

```sh
bun skills/design/scripts/design search "error summary"
bun skills/design/scripts/design read forms
```

## Internal App

Load the internal-app stack skill (TanStack Start, Effect 4, StyleX,
react-aria-components, Aperture) for one session:

```sh
npx skills use kevin-courbet/skills@internal-app
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill internal-app -y
```

## Data Visualizations

Load the Aperture visualization skill for one session:

```sh
npx skills use kevin-courbet/skills@create-data-visualizations
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill create-data-visualizations -y
```

`frontend-design`, `design`, and `internal-app` are developed in this repository.
`create-data-visualizations` is developed in
[Aperture](https://github.com/kevin-courbet/aperture) and is published here by
automation. Do not edit its generated distribution copy.

## Validation

Run:

```sh
bash scripts/validate-skills
```
