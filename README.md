# Custom Elements Toolkit

Example Use:

```typescript
@Provider({
  componentSelector: 'custom-provider',
  getDependencyMap: () => ({
    A_KEY: 'a value...',
  }),
})
export class CustomProvider extends BaseProvider<{
  A_KEY: string;
}> {}

@Component({
  componentSelector: 'custom-component',
  templateSelector: '#custom-component-template',
  useShadow: false,
})
export class CustomComponent extends BaseComponent {
  override connectedCallback() {
    super.connectedCallback();

    const value = this.getContext<string>('A_KEY');
    const span = this.querySelector('span');
    if (span) {
      span.innerText = ' ' + value;
    }
  }
}
```

```html
<template id="custom-component-template">
  <div>foo...<span></span></div>
</template>

<custom-provider>
  <div id="cont">
    <custom-component></custom-component>

    <!-- imagine this is server rendered -->
    <custom-component isSSR="true">
      <div>foo... (server) <span></span></div>
    </custom-component>
  </div>
</custom-provider>

<script>
  window.setTimeout(() => {
    const component = new CustomComponent();
    document.querySelector('#cont').appendChild(component);
  }, 2000);
</script>
```
