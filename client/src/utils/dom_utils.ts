import { api, mainContainer, showData } from "../client";

export function hide(element: HTMLElement) {
    element.hidden = true;
}

export function show(element: HTMLElement) {
    element.hidden = false;
}

export function addLoadMoreButton(buttonText: string, onPressed: (button: HTMLButtonElement) => void) {
    const button = document.createElement('button') as HTMLButtonElement;
    button.className = 'load-more-btn';
    if (api.gotAllData) {
        button.style.visibility = 'hidden';
    }
    button.textContent = buttonText;
    button.addEventListener('click', async () => {
        if (button.classList.contains('disabled-btn')) return;
        button.classList.add('disabled-btn');
        await onPressed(button);
        button.classList.remove('disabled-btn');
    })
    mainContainer.appendChild(button);
}