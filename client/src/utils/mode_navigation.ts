const buttonsList = document.querySelector('.nav-buttons')! as HTMLUListElement;

type Mode = 'tables' | 'charts' | 'calendar' | { id: string };

export class ModeNavigation {
    private selectedMode: Mode = 'calendar';

    get mode(): Mode {
        return this.selectedMode;
    }

    constructor(private onModeChange: (mode: Mode) => void) {
        this.selectedMode = this.getModeFromHash() ?? this.selectedMode;

        window.addEventListener('popstate', () => {
            this.changeMode(this.getModeFromHash() ?? this.selectedMode, false);
        });

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
                this.changeMode(newMode);
            });
        }
    }

    private getModeFromHash(): Mode | null {
        const modeString = window.location.hash.substr(1);
        if (modeString.length == 0) return null;

        if (modeString.startsWith('id-')) {
            return { id: modeString.substr(3) };
        } else {
            return modeString as Mode;
        }
    }

    changeMode(mode: Mode, updateHash: boolean = true) {
        if (mode === this.selectedMode) return;

        if (typeof this.selectedMode != 'object') {
            const prevSelectedButton = buttonsList.querySelector(`#${this.selectedMode}`)! as HTMLButtonElement;
            prevSelectedButton.className = '';
        }

        if (updateHash) {
            window.history.pushState('', '', typeof mode == 'object' ? `#id-${mode.id}` : `#${mode}`);
        }

        if (typeof mode == 'string') {
            buttonsList.querySelector(`#${mode}`)!.className = 'nav-selected';
        }

        this.selectedMode = mode;
        this.onModeChange(mode);
    }
}