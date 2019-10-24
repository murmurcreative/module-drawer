import { html, css, LitElement } from 'lit-element';

export class MurmurDrawer extends LitElement {
  static get styles() {
    return css`
      :host > .heading {
        font-family: var(--mod-heading-typeface, inherit);
        font-size: var(--mod-heading-size, 1.5rem);
        color: var(--mod-heading-color, currentColor);
      }

      button {
        all: inherit;
        cursor: pointer;
        display: var(--mod-heading-display, flex);
        align-items: var(--mode-heading-align-items, center);
        justify-content: var(--mode-heading-justify, space-between);
        text-align: var(--mode-heading-align-text, left);
        padding: var(--mode-heading-padding, 0);
        margin: var(--mode-heading-margin, 0);
        width: var(--mode-heading-width, 100%);
      }

      .content  {
        padding: var(--mode-content-padding, 0);
        margin: var(--mode-content-margin, 0);
        text-align: var(--mode-content-align-text, left);
        font-family: var(--mod-content-typeface, inherit);
        font-size: var(--mod-content-size, 1rem);
        color: var(--mod-content-color, currentColor);
      }

      ${this.svgStyles}
    `;
  }

  static get svgStyles() {
    return css`
      button svg {
        width: 1em;
        height: 1em;
        display: inline-block;
      }

      button:focus svg {
        outline: 2px solid;
      }

      button[aria-expanded] rect {
        fill: currentColor;
      }

      button[aria-expanded="true"] .vert {
        display: none;
      }
    `
  }

  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
      role: {type: String, reflect: true},
      headless: {type: Boolean},
      heading: {type: Object},
    };
  }

  constructor() {
    super();
    this.role = 'region';
    this.open = this.hasAttribute(`open`) || false;
    this.headless = this.hasAttribute(`headless`) || false;
    this.button = null;
    this.heading = {
      id: this.getAttribute(`name`) ? this.__urlify(this.getAttribute(`name`)) : false,
      level: 2,
    };
    
    /** Handle the heading and its level */
    const lightHeading = !this.headless 
      ? this.querySelector(`:first-child`)
      : false;

    if (!this.headless && lightHeading) {
      /** Determine the heading level */
      const lightHeadingLevel = parseInt(lightHeading.tagName.substr(1));

      if (lightHeadingLevel > 0) {
        this.heading.label = lightHeading ? lightHeading.textContent : false;
        this.heading.id = lightHeading.id ? this.__urlify(lightHeading.id) : false;

        /** Remove the heading so it doesn't appear twice */
        lightHeading.parentNode.removeChild(lightHeading);

        if (lightHeadingLevel && 2 !== lightHeadingLevel) {
          this.heading.level = lightHeadingLevel;
        }
      } else {
        this.headless = true;
      }
    }

    this.addEventListener(`drawer-opened`, () => {
      if (this.heading.id && this.open && window.location.hash.substr(1) !== this.heading.id) {
        history.pushState(null, null, '#' + this.heading.id);
      }
    })

    this.addEventListener(`drawer-closed`, () => {
      if (this.heading.id && window.location.hash.substr(1) === this.heading.id) {
        history.pushState(null, null, window.location.pathname);
      }
    })

    this.events = {
      opened: new CustomEvent(`drawer-opened`),
      closed: new CustomEvent(`drawer-closed`),
    }
  }

  firstUpdated() {
    this.button = this.shadowRoot.querySelector(`button`);

    if (this.heading.id && window.location.hash.substr(1) === this.heading.id) {
      this.open = true;
      this.button.focus();
    } 
  }

  updated(changed) {
    changed.forEach((oldValue, prop) => {
      if (`open` === prop) {
        switch(oldValue) {
          case true:
            this.dispatchEvent(this.events.closed);
            break;
          case false:
            this.dispatchEvent(this.events.opened);
            break;
        }
      }
    })
  }

  toggle() {
    this.open = !this.open;
  }

  __urlify(string) {
    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  __makeSvg() {
    return html`
      <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
        <rect class="vert" height="8" width="2" y="1" x="4"/>
        <rect height="2" width="8" y="4" x="1"/>
      </svg>
    `;
  }

  __makeHeading() {
    return !this.headless
      ? html`
          <h3 aria-level=${this.heading.level} class="heading" id=${this.heading.id}>
            <button aria-expanded=${this.open} @click=${this.toggle}>
              <span>${this.heading.label}</span>
              ${this.__makeSvg()}
            </button>
          </h3>
        `
      : html``;
  }

  render() {
    return html`
      ${this.__makeHeading()}
      <div class="content" ?hidden=${!this.open}>
        <slot></slot>
      </div>
    `;
  }
}
