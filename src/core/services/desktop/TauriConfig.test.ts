import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type PackageJson = {
    scripts: Record<string, string>;
};

type TauriConfig = {
    build: {
        beforeDevCommand: string;
        beforeBuildCommand: string;
        devUrl: string;
        frontendDist: string;
    };
    bundle: {
        active: boolean;
    };
};

const readJson = <T>(path: string): T => {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
};

describe('Tauri desktop configuration', () => {
    it('should expose desktop scripts and align Tauri with the Vite build contract', () => {
        // Arrange
        // Use a relative path from this file to reach the root
        const root = join(__dirname, '../../../../');
        const packageJson = readJson<PackageJson>(join(root, 'package.json'));
        const tauriConfig = readJson<TauriConfig>(join(root, 'src-tauri', 'tauri.conf.json'));

        // Act
        const scripts = packageJson.scripts;
        const build = tauriConfig.build;

        // Assert
        expect(scripts.tauri).toBe('tauri');
        expect(scripts['desktop:dev']).toBe('tauri dev');
        expect(scripts['desktop:build']).toBe('tauri build');
        expect(build.beforeDevCommand).toBe('npm run dev');
        expect(build.beforeBuildCommand).toBe('npm run build');
        expect(build.devUrl).toBe('http://localhost:8080');
        expect(build.frontendDist).toBe('../dist');
        expect(tauriConfig.bundle.active).toBe(true);
    });
});
