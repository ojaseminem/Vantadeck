Pipeline OS 0.2.2

- Portable project thumbnails: stored in `.vantadeck/project.toml` so they travel with the repo to other machines; shown on the home Continue card and the project list, and set/cleared from the project view.
- Real "Last opened" timestamps across the dashboard and project list.
- Project Health is no longer blank: the dashboard, Health screen, and project view show cached results with a last-checked time and a Re-check action; the dashboard refreshes lightweight health for every project on load.
- Source control history: expand any commit to see the files it changed.

This is a signed auto-updater release; installed 0.2.x clients update in place.
