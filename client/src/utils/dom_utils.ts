import { api, mainContainer, showData } from "../client";

export function hide(element: HTMLElement) {
    element.hidden = true;
}

export function show(element: HTMLElement) {
    element.hidden = false;
}

export function addLoadMoreButton(buttonText: string = 'Show More') {
    const button = document.createElement('button') as HTMLButtonElement;
    button.className = 'load-more-btn';
    if (api.gotAllData) {
        button.style.visibility = 'hidden';
    }
    button.textContent = buttonText;
    button.addEventListener('click', async () => {
        button.classList.add('disabled-btn');
        await api.loadMoreData();
        showData();
    })
    mainContainer.appendChild(button);
}