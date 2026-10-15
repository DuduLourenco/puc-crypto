/**
 * Testes de arquitetura do BFF com ArchUnitTS (npm run test:arch).
 * Camadas: domain <- application <- infrastructure e api; main.ts e app.module.ts são a raiz de composição.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { FileInfo, projectFiles } from 'archunit';

const FEATURES_DIR = 'src/application/features';

/** Módulos importados pelo arquivo (import, export ... from, import() e require). */
const importsOf = (file: FileInfo): string[] =>
  [...file.content.matchAll(/\bfrom\s+['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]|\brequire\(\s*['"]([^'"]+)['"]\)/g)].map(
    (match) => match[1] ?? match[2] ?? match[3],
  );

/** Verdadeiro quando o arquivo só importa arquivos do próprio projeto (nenhum pacote npm nem módulo do Node). */
const importsOnlyProjectFiles = (file: FileInfo): boolean =>
  importsOf(file).every((specifier) => specifier.startsWith('.'));

const slices = readdirSync(join(__dirname, '..', '..', FEATURES_DIR), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('Clean Architecture', () => {
  it('domain não depende de application, infrastructure nem api', async () => {
    const rule = projectFiles()
      .inFolder('src/domain/**')
      .shouldNot()
      .dependOnFiles()
      .inFolder(/^src\/(application|infrastructure|api)(\/|$)/);

    await expect(rule).toPassAsync();
  });

  it('domain é TypeScript puro: não importa pacotes npm nem módulos do Node', async () => {
    const rule = projectFiles()
      .inFolder('src/domain/**')
      .should()
      .adhereTo(importsOnlyProjectFiles, 'O domain só importa arquivos do próprio domain');

    await expect(rule).toPassAsync();
  });

  it('application não depende de infrastructure nem de api', async () => {
    const rule = projectFiles()
      .inFolder('src/application/**')
      .shouldNot()
      .dependOnFiles()
      .inFolder(/^src\/(infrastructure|api)(\/|$)/);

    await expect(rule).toPassAsync();
  });

  it('application não depende de frameworks (NestJS, HTTP, pacotes npm ou módulos do Node)', async () => {
    const rule = projectFiles()
      .inFolder('src/application/**')
      .should()
      .adhereTo(importsOnlyProjectFiles, 'A application só importa arquivos do projeto');

    await expect(rule).toPassAsync();
  });

  it('infrastructure não depende de api', async () => {
    const rule = projectFiles().inFolder('src/infrastructure/**').shouldNot().dependOnFiles().inFolder('src/api/**');

    await expect(rule).toPassAsync();
  });

  it('api não depende de infrastructure (só a raiz de composição conhece os adaptadores)', async () => {
    const rule = projectFiles().inFolder('src/api/**').shouldNot().dependOnFiles().inFolder('src/infrastructure/**');

    await expect(rule).toPassAsync();
  });

  it('não há dependências circulares', async () => {
    const rule = projectFiles().inFolder('src/**').should().haveNoCycles();

    await expect(rule).toPassAsync();
  });
});

describe('Vertical Slice', () => {
  it('existem slices em application/features', () => {
    expect(slices.length).toBeGreaterThan(1);
  });

  it.each(slices)('a slice %s não referencia outras slices', async (slice) => {
    const rule = projectFiles()
      .inFolder(`${FEATURES_DIR}/${slice}`)
      .shouldNot()
      .dependOnFiles()
      .inFolder(`${FEATURES_DIR}/**`, { except: { inFolder: `${FEATURES_DIR}/${slice}` } });

    await expect(rule).toPassAsync();
  });

  it.each(slices)('a slice %s segue a convenção <caso-de-uso>.(command|query|handler).ts', async (slice) => {
    const rule = projectFiles()
      .inFolder(`${FEATURES_DIR}/${slice}`)
      .should()
      .adhereTo(
        (file) => new RegExp(`^${slice}\\.(command|query|handler)$`).test(file.name) && file.extension === 'ts',
        `Arquivos da slice ${slice} se chamam ${slice}.command.ts, ${slice}.query.ts ou ${slice}.handler.ts`,
      );

    await expect(rule).toPassAsync();
  });
});
