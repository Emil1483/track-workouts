import { modeNavigation, mainContainer, loadingElement, api } from "../client";
import { hide } from "../utils/dom_utils";
import { buildWorkoutTablesFor } from "./tables";

export async function showDetails() {
    const mode = modeNavigation.mode as {id: string};
    const id = mode.id;

    const workout = await api.getWorkoutById(id);
    if (workout == null) return;
    hide(loadingElement);

    const workoutTables = buildWorkoutTablesFor(workout);
    mainContainer.appendChild(workoutTables);
}