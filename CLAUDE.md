You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Every component MUST have its own `.ts` and `.html` files — never use inline `template`, even for small components. Add a `.scss` file (via `styleUrl`) only when the component has its own styles; never use inline `styles`. Put a component with more than one file in its own folder (e.g. `shared/components/data-table/`)
- Choose the forms API by complexity:
  - Simple forms (a few fields, basic validation — e.g. login, change password, profile settings): use Signal Forms (`@angular/forms/signals`). They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
  - Complex forms with heavy logic (dependent fields, cross-field validation, dynamically generated fields): use Reactive Forms. The shared config-driven `app-crud-form` component falls in this group and stays on Reactive Forms
  - Prefer either of the above over Template-driven forms
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Theming & Design Tokens

Global UI is configured through CSS custom properties (design tokens); `ThemeService` (`src/app/core/services/theme.service.ts`) switches `light` (default) / `dark` by setting `data-theme` on `<html>`.

- Entry points: `src/styles.css` (Tailwind + ng-zorro base CSS in `@layer antd`) and `src/styles/styles.scss` (tokens, themes, component mappings). Keep Tailwind out of SCSS files.
- Token layers:
  - `src/styles/abstracts/_tokens.scss` — theme-independent tokens (sizes, spacing, radius, typography, icon sizes) and component tokens (`--button-*`, `--input-*`, `--menu-*`, `--table-*`, ...) that default to global tokens.
  - `src/styles/themes/_light-theme.scss` / `_dark-theme.scss` — token VALUES only (colors, shadows, per-theme component overrides). Both themes must define the same token names. No component rules here.
  - `src/styles/vendors/_ng-zorro.scss` — maps tokens to ng-zorro's official `--ant-*` CSS variables.
  - `src/styles/components/_<component>.scss` — maps tokens onto ng-zorro classes inside `@include m.ng-zorro-override` (same `antd` layer, so ng-zorro state rules keep working and Tailwind utilities still win).
- Token naming: global `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--icon-size-*`, `--control-height-*`; component `--<component>-<part>-<property>[-<state>]` (e.g. `--button-primary-bg-hover`).
- Never hardcode colors/sizes in component styles or templates. In templates use the semantic Tailwind utilities `bg-page`, `bg-surface`, `bg-elevated`, `bg-subtle`, `border-line`, `text-fg`, `text-fg-muted`, `text-brand`, `bg-brand-solid`, `text-on-brand`, `text-danger` (defined via `@theme inline` in `src/styles.css`). In `.scss` use `var(--token)`.
- Adding a token: declare it in `_tokens.scss` (default value referencing global tokens) and, if it differs per theme, override it in both theme files.
- Supporting a new ng-zorro component: add `src/styles/components/_<component>.scss`, map its colors/sizes/states (including hover/focus/active/disabled where ng-zorro hardcodes neutral colors) to tokens, `@use` it in `src/styles/styles.scss`, then verify both themes and contrast (WCAG AA).
