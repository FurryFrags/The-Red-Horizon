# The Red Horizon: Act 1 (Prototype)

A browser strategy prototype inspired by HOI4-style operational combat, focused only on warfare systems:

- Ground, Air, and Naval units.
- HP + Organization combat model.
- Blitzkrieg bonuses in plains/desert.
- Encirclement penalties for isolated enemy provinces.
- Story campaign from NATO training in Poland to US homeland defense.

## Run

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Data

- `data/missions.json`: Story + mission objectives, control setup, and adjacency graph.
- Province polygons are fetched in real time from the [geoBoundaries](https://www.geoboundaries.org/) ADM1 API and mapped to mission provinces.

