# Estoque Vendas

Inventory and sales management system built with Next.js.

## Scripts

- `npm run dev` – start development server
- `npm run build` – create production build
- `npm start` – run production build
- `npm test` – run unit tests

## Project Structure

```
src/
  components/    # Reusable UI components
  context/       # React contexts for shared state
  hooks/         # Custom hooks
  lib/           # Utility functions and libraries
  pages/         # Next.js route files that compose components
  styles/        # Global styles
```

## Testing

Tests use Jest and React Testing Library. Add new tests under the `tests/` folder.

## Configuration

Path alias `@` points to the `src/` directory, allowing absolute imports such as `import Button from '@/components/Button';`.
