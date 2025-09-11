import React from 'react';
import { createRoot } from 'react-dom/client';
import CustomWidgetContainer from './CustomWidgetContainer';

class CustomWidgetContainerWebComponent extends HTMLElement {
    constructor() {
        super();
        this._rootInstance = null;
        this._stylesCloned = false;
    }

    static get observedAttributes() {
        return ["data-number-of-widgets"];
    }

    attributeChangedCallback(name, oldV, newV) {
        if (name === "data-number-of-widgets" && oldV !== newV) {
            this._renderReact();
        }
    }

    connectedCallback() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
        }
        const shadow = this.shadowRoot;

        let reactRoot = shadow.querySelector(".react-root");
        if (!reactRoot) {
            reactRoot = document.createElement("div");
            reactRoot.className = "react-root";
            shadow.appendChild(reactRoot);
        }

        if (!this._stylesCloned) {
            const parentLinks = document.querySelectorAll('link[rel="stylesheet"]');
            parentLinks.forEach((link, i) => {
                const shadowLink = document.createElement("link");
                shadowLink.rel = "stylesheet";
                shadowLink.href = link.href;
                shadowLink.setAttribute("data-cloned-from", String(i));
                shadow.appendChild(shadowLink);
            });

            const parentStyles = document.querySelectorAll("style");
            parentStyles.forEach((style, i) => {
                const shadowStyle = document.createElement("style");
                shadowStyle.textContent = style.textContent;
                shadowStyle.setAttribute("data-cloned-from", String(i));
                shadow.appendChild(shadowStyle);
            });

            this._stylesCloned = true;
        }

        this._renderReact();
    }

    disconnectedCallback() {
        if (this._rootInstance) {
            this._rootInstance.unmount();
            this._rootInstance = null;
        }
    }

    _getWidgetsFromSlots() {
        const widgetElements = this.querySelectorAll('div[slot]');
        return Array.from(widgetElements).map((element) => {
            const widgetId = element.getAttribute("slot");
            const labelElement = this.querySelector(`[data-label-for="${widgetId}"]`);
            const label = labelElement ? labelElement.textContent : "No label";
            return { widgetId, label };
        });
    }

    _renderReact() {
        const reactRoot = this.shadowRoot?.querySelector(".react-root");
        if (!reactRoot) return;

        if (!this._rootInstance) {
            this._rootInstance = createRoot(reactRoot);
        }

        const widgets = this._getWidgetsFromSlots();

        this._rootInstance.render(
            <CustomWidgetContainer
                availableWidgets={widgets}
                numberOfWidgets={this.getAttribute("data-number-of-widgets")}
            />
        );
    }
}

const CUSTOM_WIDGET_CONTAINER_ELEMENT_ID = "custom-widget-container";
if (!customElements.get(CUSTOM_WIDGET_CONTAINER_ELEMENT_ID)) {
    customElements.define(
        CUSTOM_WIDGET_CONTAINER_ELEMENT_ID,
        CustomWidgetContainerWebComponent
    );
}
