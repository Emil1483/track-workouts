const buttonsList = document.querySelector('.nav-buttons')! as HTMLUListElement;

type Mode = 'tables' | 'graphs' | 'calendar';

export class ModeNavigation {
    private selectedMode: Mode = 'calendar';

    get mode(): Mode {
        return this.selectedMode;
    }

    constructor(onModeChange: (mode: Mode) => void) {
        const listItems = buttonsList.children;
        for (let i = 0; i < listItems.length; i++) {
            const listItem = listItems.item(i);
            const button = listItem!.children.item(0)! as HTMLButtonElement;

            if (button.id === this.selectedMode) {
                button.className = 'nav-selected';
            } else {
                button.className = '';
            }

            button.addEventListener('click', () => {
                const newMode = button.id as Mode;
                if (newMode === this.selectedMode) return;

                const prevSelectedButton = buttonsList.querySelector(`#${this.selectedMode}`)! as HTMLButtonElement;
                prevSelectedButton.className = '';
                button.className = 'nav-selected';

                this.selectedMode = newMode;
                onModeChange(this.selectedMode);
            });
        }
    }
}