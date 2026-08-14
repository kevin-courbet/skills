# ADR 0001: Skill Source Ownership

## Status

Accepted

## Decision

The public `kevin-courbet/skills` repository is the distribution catalog for
standalone agent skills.

`ui-design` is developed and distributed from this repository.

`create-data-visualizations` remains under development in the Aperture
repository. Aperture publishes its complete skill directory to this repository
after changes land on Aperture `main`. The copy in this repository is generated
distribution output and is not a second development source. Each generated copy
records its exact Aperture source commit, and validation compares the copy with
that commit.

Consumers load and install both skills from `kevin-courbet/skills` with the
`skills` CLI.
