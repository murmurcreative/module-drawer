import { html, css, LitElement } from 'lit-element';

export class MurmurDrawer extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
      }
    `;
  }

  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
      role: {type: String, reflect: true},
      headless: {type: Boolean},
    };
  }

  constructor() {
    super();
    this.level = 2;
    this.role = 'region';
    this.open = this.hasAttribute(`open`) || false;
    this.headless = this.hasAttribute(`headless`) || false;
    
    /** Handle the heading and its level */
    const lightHeading = !this.headless 
      ? this.querySelector(`:first-child`)
      : false;

    this.label = lightHeading ? lightHeading.textContent : false;

    if (lightHeading) {
      /** Remove the heading so it doesn't appear twice */
      lightHeading.parentNode.removeChild(lightHeading);

      /** Determine the heading level */
      const lightHeadingLevel = parseInt(lightHeading.tagName.substr(1));
      if (!lightHeadingLevel) {
        console.warn('The first element inside each <murmur-drawer> should be a heading of an appropriate level.');
      }
      if (lightHeadingLevel && 2 !== lightHeadingLevel) {
        this.level = lightHeadingLevel;
      }
    }

    this.events = {
      opened: new CustomEvent(`drawer-opened`),
      closed: new CustomEvent(`drawer-closed`),
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

  __toggle() {
    this.open = !this.open;
  }

  __makeHeading() {
    return !this.headless
      ? html`
          <h3 aria-level="${this.level}" class="heading">
            ${this.label}
            <button aria-expanded=${this.open} @click=${this.__toggle}>
              <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
                <rect class="vert" height="8" width="2" y="1" x="4"/>
                <rect height="2" width="8" y="4" x="1"/>
              </svg>
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
