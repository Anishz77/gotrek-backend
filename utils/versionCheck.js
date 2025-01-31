const semver = require('semver');
const pkg = require('../package.json');

const checkDependencies = () => {
    const criticalDeps = {
        'express': '4.18.0',
        'mongoose': '8.0.0',
        'jsonwebtoken': '9.0.0',
        'bcrypt': '5.1.0'
    };

    const outdated = [];
    
    Object.entries(criticalDeps).forEach(([dep, minVersion]) => {
        const currentVersion = pkg.dependencies[dep].replace('^', '');
        if (!semver.gte(currentVersion, minVersion)) {
            outdated.push(`${dep}: ${currentVersion} < ${minVersion}`);
        }
    });

    if (outdated.length > 0) {
        console.warn('WARNING: Critical dependencies need updating:');
        outdated.forEach(dep => console.warn(`- ${dep}`));
    }
};

module.exports = checkDependencies; 