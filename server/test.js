console.log('CWD:', process.cwd());
console.log('Module Paths:');
console.log(module.paths);
try {
    require('express');
    console.log('SUCCESS: Express required');
} catch (e) {
    console.error('FAIL:', e.message);
    console.error('Code:', e.code);
    console.error('Require Stack:', e.requireStack);
}
