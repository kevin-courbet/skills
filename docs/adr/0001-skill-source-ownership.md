# ADR 0001: Skill Source Ownership

## Status

Accepted

## Decision

The public `kevin-courbet/skills` repository is the distribution catalog for
standalone agent skills.

`ui-design` is developed and distributed from this repository.

`create-data-visualizations` remains under development in the Aperture
repository. A catalog-owned workflow polls Aperture `main`, selects the latest
commit that changed the skill, and publishes its complete skill directory to
this repository. The copy in this repository is generated distribution output
and is not a second development source. Each generated copy records its exact
Aperture source commit, and validation compares the copy with that commit.

Validation runs without catalog write access. A separate catalog job publishes
only the validated skill artifact and source record. A bounded monthly heartbeat
keeps GitHub from disabling the scheduled publisher during repository inactivity.

Consumers load and install catalog skills from `kevin-courbet/skills` with the
`skills` CLI.
