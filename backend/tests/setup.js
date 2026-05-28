/**
 * Setup para tests
 * Configuración global antes de ejecutar pruebas
 */

// Desactivar logs en tests
global.console.log = jest.fn();

// Timeout global para tests
jest.setTimeout(10000);
