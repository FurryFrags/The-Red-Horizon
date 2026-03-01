# HOI4 + Spirits of Steel Research Notes for Red Horizon

## Hearts of Iron IV (HOI4) operational takeaways

- **Frontline contact is the combat trigger:** divisions only fight when adjacent and ordered into hostile territory. Long-range attacks do not happen without frontline contact.
- **Continuous front systems:** movement and battle are driven by province adjacency, not isolated scripted lanes.
- **Control + occupancy separation:** provinces can be controlled, contested, or empty; movement into empty territory should be possible without immediate battle.
- **Terrain-weighted combat:** plains/desert favor breakthrough tempo, mountain/hills increase defensive staying power.

## Spirits of Steel-inspired takeaways

- **Map continuity matters:** strategic planning is stronger when entire national space is traversable and not restricted to tiny mission-only nodes.
- **Positioning before engagement:** movement to contact should be distinct from the actual attack action.
- **Encouragement of maneuver warfare:** pushing to contact, then choosing when to initiate a battle, gives player agency over operational tempo.

## Applied design decisions in this branch

1. Every mission now includes all ADM1 provinces from each focused country as playable movement space.
2. Mission adjacency is generated across same-country provinces using live boundary geometry proximity, so countries behave like full maneuver maps.
3. Movement into defended enemy provinces no longer auto-starts combat: armies advance to the adjacent staging province and establish contact.
4. Combat can only be started if the selected allied province directly borders the enemy province.

These changes align the prototype more closely with frontline-contact operational logic seen in grand strategy and operational war games.
