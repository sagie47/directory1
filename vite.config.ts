import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import {defineConfig, loadEnv} from 'vite';

const BUDGETS = {
  maxChunkSizeKB: 500,
  maxInitialLoadKB: 800,
  maxGzipSizeKB: 250,
} as const;

type BudgetKey = keyof typeof BUDGETS;

function enforceBuildBudgets() {
  return {
    name: 'enforce-build-budgets',
    closeBundle() {
      const skipBudgetCheck = process.env.SKIP_BUDGET_CHECK;
      if (skipBudgetCheck && ['true', '1'].includes(skipBudgetCheck.toLowerCase())) {
        console.log('\x1b[33m⚠ Build budget check skipped via SKIP_BUDGET_CHECK\x1b[0m');
        return;
      }

      const distDir = path.join(__dirname, 'dist', 'assets');
      const overBudget: Array<{
        file: string;
        sizeKB: number;
        gzipKB: number;
        limitKB: number;
        budgetType: BudgetKey;
        percentOver: number;
      }> = [];

      try {
        const files = fs.readdirSync(distDir);
        let initialLoadKB = 0;

        for (const file of files) {
          if (!file.endsWith('.js')) continue;
          const filePath = path.join(distDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = stats.size / 1024;
          const gzipContent = fs.readFileSync(filePath);
          const gzipKB = zlib.gzipSync(gzipContent).length / 1024;

          if (file.includes('index-') || file === 'index.js') {
            initialLoadKB += sizeKB;
          }

          if (sizeKB > BUDGETS.maxChunkSizeKB) {
            overBudget.push({
              file,
              sizeKB: Math.round(sizeKB),
              gzipKB: Math.round(gzipKB),
              limitKB: BUDGETS.maxChunkSizeKB,
              budgetType: 'maxChunkSizeKB',
              percentOver: Math.round(((sizeKB - BUDGETS.maxChunkSizeKB) / BUDGETS.maxChunkSizeKB) * 100),
            });
          }

          if (gzipKB > BUDGETS.maxGzipSizeKB) {
            overBudget.push({
              file,
              sizeKB: Math.round(sizeKB),
              gzipKB: Math.round(gzipKB),
              limitKB: BUDGETS.maxGzipSizeKB,
              budgetType: 'maxGzipSizeKB',
              percentOver: Math.round(((gzipKB - BUDGETS.maxGzipSizeKB) / BUDGETS.maxGzipSizeKB) * 100),
            });
          }
        }

        if (initialLoadKB > BUDGETS.maxInitialLoadKB) {
          const percentOver = Math.round(
            ((initialLoadKB - BUDGETS.maxInitialLoadKB) / BUDGETS.maxInitialLoadKB) * 100
          );
          overBudget.push({
            file: 'initial load (index + dependencies)',
            sizeKB: Math.round(initialLoadKB),
            gzipKB: 0,
            limitKB: BUDGETS.maxInitialLoadKB,
            budgetType: 'maxInitialLoadKB',
            percentOver,
          });
        }
      } catch {
        return;
      }

      if (overBudget.length > 0) {
        const grouped = overBudget.reduce(
          (acc, item) => {
            if (!acc[item.budgetType]) acc[item.budgetType] = [];
            acc[item.budgetType].push(item);
            return acc;
          },
          {} as Record<BudgetKey, typeof overBudget>
        );

        const errorLines: string[] = [
          '',
          '\x1b[31m✖ BUILD BUDGET EXCEEDED\x1b[0m',
          '\x1b[33m═══════════════════════════════════════════════════════════════\x1b[0m',
          '',
          '\x1b[1mThe following assets exceed build budgets:\x1b[0m',
          '',
        ];

        for (const [budgetType, items] of Object.entries(grouped)) {
          const limit = BUDGETS[budgetType as BudgetKey];
          errorLines.push(`\x1b[1m${budgetType} (limit: ${limit} KB):\x1b[0m`);
          for (const b of items) {
            const gzipInfo = b.gzipKB > 0 ? ` (gzip: ${b.gzipKB} KB)` : '';
            errorLines.push(
              `  \x1b[31m✖\x1b[0m \x1b[33m${b.file}\x1b[0m` +
                `\n    Size: \x1b[31m${b.sizeKB} KB\x1b[0m${gzipInfo} (+${b.percentOver}% over limit)`
            );
          }
          errorLines.push('');
        }

        errorLines.push('\x1b[1mAction required:\x1b[0m');
        errorLines.push('  • Split large chunks using dynamic import()');
        errorLines.push('  • Use build.rollupOptions.output.manualChunks to separate vendor code');
        errorLines.push('  • Move large static data to separate JSON files loaded on demand');
        errorLines.push('  • Consider tree-shaking unused imports from large libraries');
        errorLines.push('');
        errorLines.push('\x1b[33m═══════════════════════════════════════════════════════════════\x1b[0m');
        errorLines.push('');

        console.error(errorLines.join('\n'));
        process.exit(1);
      }

      console.log(
        `\x1b[32m✓ Build budget check passed\x1b[0m (chunk: ${BUDGETS.maxChunkSizeKB} KB, ` +
          `gzip: ${BUDGETS.maxGzipSizeKB} KB, initial: ${BUDGETS.maxInitialLoadKB} KB)`
      );
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), enforceBuildBudgets()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: BUDGETS.maxChunkSizeKB,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replace(/\\/g, '/');

            if (normalizedId.includes('node_modules')) {
              if (normalizedId.includes('@supabase/supabase-js')) {
                return 'supabase';
              }

              if (normalizedId.includes('motion/')) {
                return 'motion';
              }

              if (
                normalizedId.includes('/react-router-dom/')
                || normalizedId.includes('/react-dom/')
                || normalizedId.includes('/react/')
              ) {
                return 'vendor';
              }

              if (
                normalizedId.includes('/lucide-react/')
                || normalizedId.includes('/clsx/')
                || normalizedId.includes('/tailwind-merge/')
              ) {
                return 'ui';
              }
            }

            if (
              normalizedId.endsWith('/src/contexts/AuthContext.tsx')
              || normalizedId.endsWith('/src/lib/auth.ts')
              || normalizedId.endsWith('/src/lib/supabase.ts')
            ) {
              return 'auth';
            }

            if (
              normalizedId.endsWith('/src/directory-data.tsx')
              || normalizedId.endsWith('/src/lib/seedData.ts')
              || normalizedId.endsWith('/src/business.ts')
            ) {
              return 'directory-data';
            }

            if (
              normalizedId.endsWith('/src/components/Layout.tsx')
              || normalizedId.endsWith('/src/components/UserMenu.tsx')
              || normalizedId.endsWith('/src/components/AuthGuard.tsx')
              || normalizedId.endsWith('/src/components/AdminGuard.tsx')
            ) {
              return 'app-shell';
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/generated/gmaps-scraper/**', '**/generated/cache/**'],
      },
    },
  };
});
