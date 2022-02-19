import { REQUEST_DEPENDENCY_EVENT_NAME } from './constants';

/**
 * Providers should extend this base class so that dependency
 * tokens can be received.
 */
export class BaseProvider<T> extends HTMLElement {
  private providerConfig?: ProviderConfig<T>;
  private dependencyMap?: Record<string, any>;

  constructor() {
    super();

    const dependencyMap = this.providerConfig?.getDependencyMap();
    if (dependencyMap) {
      this.dependencyMap = dependencyMap;
    }

    this.serveDependency = this.serveDependency.bind(this);
  }

  public connectedCallback(): void {
    this.addEventListener(REQUEST_DEPENDENCY_EVENT_NAME, this.serveDependency);
  }

  public disconnectedCallback(): void {
    this.removeEventListener(
      REQUEST_DEPENDENCY_EVENT_NAME,
      this.serveDependency
    );
  }

  private serveDependency(event: Event) {
    if (!this.dependencyMap) {
      return;
    }

    const customEvent = event as CustomEvent;
    const token = customEvent.detail.token;
    if (token) {
      const value = this.dependencyMap[token];
      if (value) {
        customEvent.detail.value = value;
      } else {
        customEvent.detail.value = null;
        console.warn(`no dependency found for ${token} token`);
      }
    }
  }
}

/**
 * Configuration used by the base provider.
 */
export interface ProviderConfig<T extends { [key: string]: any }> {
  /**
   * The selector of a component, e.g. `'my-input'` so that
   * it can be used like `<my-input></my-input>` in the DOM.
   */
  componentSelector: string;
  /**
   * A function that should return an object literal map of tokens
   * as a key and a dependency as a value.
   */
  getDependencyMap: () => T;
}

/**
 * Decorator used for provider classes. Sets the provider config,
 * defines the custom element, and exposes the custom element on Window.
 */
export function Provider<T>(
  config: ProviderConfig<T> = {
    componentSelector: '',
    getDependencyMap: () => {
      return {} as T;
    },
  }
) {
  return function <U extends { new (...args: any[]): BaseProvider<T> }>(
    target: U
  ) {
    target.prototype.providerConfig = config;

    customElements.define(config.componentSelector, target);
    (window as any)[target.name] = target;
  };
}
