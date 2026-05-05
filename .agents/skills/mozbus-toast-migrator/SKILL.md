# Skill: MozBus Toast Migrator

## Objective
Convert all instances of browser native `alert()` and `confirm()` into the premium `EliteToast` system.

## Steps
1. Scan the `mozbus-web/src` directory for `alert(` or `confirm(`.
2. In each file found:
   - Import `useToast` from `@/components/EliteToast`.
   - Initialize the hook: `const { toast } = useToast();`.
   - Replace `alert('message')` with `toast('message', 'success')` or `toast('message', 'error')` depending on context.
   - For `confirm()`, replace with a custom modal or keep if absolutely necessary, but prioritize a UI-integrated solution.
3. Validate that the `ToastProvider` is present in the parent layout.
