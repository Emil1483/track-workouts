const buttonsList = document.querySelector('.nav-buttons');
export class ModeNavigation {
    constructor(onModeChange) {
        this.selectedMode = 'calendar';
        const listItems = buttonsList.children;
        for (let i = 0; i < listItems.length; i++) {
            const listItem = listItems.item(i);
            const button = listItem.children.item(0);
            if (button.id === this.selectedMode) {
                button.className = 'nav-selected';
            }
            else {
                button.className = '';
            }
            button.addEventListener('click', () => {
                const newMode = button.id;
                if (newMode === this.selectedMode)
                    return;
                const prevSelectedButton = buttonsList.querySelector(`#${this.selectedMode}`);
                prevSelectedButton.className = '';
                button.className = 'nav-selected';
                this.selectedMode = newMode;
                onModeChange(this.selectedMode);
            });
        }
    }
    get mode() {
        return this.selectedMode;
    }
}
//# sourceMappingURL=mode_navigation.js.map