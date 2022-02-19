import { REQUEST_DEPENDENCY_EVENT_NAME } from './constants';

/**
 * Components should extend this class to have initial rendering
 * and other utilities set up.
 * The `isSSR` attribute can be used so that during the initial render
 * the component will not replace the body content.
 */
export class BaseComponent extends HTMLElement {
  protected componentConfig?: ComponentConfig;

  constructor() {
    super();
  }

  public connectedCallback(): void {
    if (!this.getAttribute('isSSR')) {
      this.renderInitialTemplate();
    }
  }

  private renderInitialTemplate(): void {
    if (this.componentConfig?.useShadow) {
      this.attachShadow({ mode: 'open' });

      if (this.componentConfig?.templateSelector) {
        const template = document.querySelector(
          this.componentConfig.templateSelector
        ) as HTMLTemplateElement;
        this.shadowRoot?.appendChild(template.content.cloneNode(true));
      } else if (this.componentConfig.template && this.shadowRoot) {
        this.shadowRoot.innerHTML = this.componentConfig.template;
      }
    } else {
      if (this.componentConfig?.templateSelector) {
        const template = document.querySelector(
          this.componentConfig.templateSelector
        ) as HTMLTemplateElement;
        this.appendChild(template.content.cloneNode(true));
      } else if (this.componentConfig?.template) {
        this.innerHTML = this.componentConfig.template;
      }
    }
  }

  /**
   * Dispatch custom events with detail data which bubble and are composed.
   * Returns any data set on the detail property by a listener.
   */
  public dispatch<T extends Record<string, any>>(name: string, detail: T): T {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail,
    });
    this.dispatchEvent(event);
    return event.detail;
  }

  /**
   * Retrieve a value from a provider. Will return null if there is no
   * value for a token.
   */
  public getContext<T>(token: string): T | null {
    const detail = this.dispatch(REQUEST_DEPENDENCY_EVENT_NAME, {
      token,
      value: null,
    });
    return detail.value as T | null;
  }
}

/**
 * Configuration used by the base component.
 */
export interface ComponentConfig {
  /**
   * The selector of a component, e.g. `'my-input'` so that
   * it can be used like `<my-input></my-input>` in the DOM.
   */
  componentSelector: string;
  /**
   * Provide when you have a template in the HTML so that
   * the component can use that to render.
   */
  templateSelector?: string;
  /**
   * Provide when you want to use a string literal for templating.
   */
  template?: string;
  /**
   * Whether or not to use the Shadow DOM. Defaults to true.
   */
  useShadow?: boolean;
}

/**
 * Decorator used for component classes. Sets the component config,
 * defines the custom element, and exposes the custom element on Window.
 */
export function Component(
  config: ComponentConfig = {
    componentSelector: '',
    useShadow: true,
  }
) {
  return function <T extends { new (...args: any[]): BaseComponent }>(
    target: T
  ) {
    target.prototype.componentConfig = config;

    customElements.define(config.componentSelector, target);
    (window as any)[target.name] = target;
  };
}
