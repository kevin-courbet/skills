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

## UI Design

Load the skill for one session:

```sh
npx skills use kevin-courbet/skills@ui-design
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill ui-design -y
```

## Form Design

Load the focused form-design entry for one session:

```sh
npx skills use kevin-courbet/skills@form-design
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill form-design -y
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

`frontend-design`, `ui-design`, `form-design`, and `internal-app` are developed in this repository.
`create-data-visualizations` is developed in
[Aperture](https://github.com/kevin-courbet/aperture) and is published here by
automation. Do not edit its generated distribution copy.

## Validation

Run:

```sh
bash scripts/validate-skills
```
