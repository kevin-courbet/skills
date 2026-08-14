# Agent Skills

Standalone agent skills published for use with the `skills` CLI.

## UI Design

Load the skill for one session:

```sh
npx skills use kevin-courbet/skills@ui-design
```

Install it for later sessions:

```sh
npx skills add kevin-courbet/skills --skill ui-design -y
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

`ui-design` is developed in this repository. `create-data-visualizations` is
developed in [Aperture](https://github.com/kevin-courbet/aperture) and is
published here by automation. Do not edit its generated distribution copy.

## Validation

Run:

```sh
bash scripts/validate-skills
```
