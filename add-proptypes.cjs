const fs = require('fs');
const path = require('path');

const srcDir = './src';

function addPropTypes(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file has function components with props
    const hasComponents = content.match(/^(function|const)\s+\w+.*\(\s*{\s*[\w\s,]+\s*}\s*\)/gm);

    if (hasComponents) {
        // Add PropTypes import if not present
        if (!content.includes('import PropTypes') && !content.includes('prop-types')) {
            const importIndex = content.indexOf('import');
            if (importIndex !== -1) {
                content = content.replace(/^(import.*\n)/m, '$1import PropTypes from \'prop-types\';\n');
                modified = true;
            }
        }

        // Add basic PropTypes for common props
        const componentsWithProps = content.match(/^(function|const)\s+(\w+).*\(\s*{\s*([\w\s,]+)\s*}\s*\)/gm);

        if (componentsWithProps) {
            componentsWithProps.forEach(match => {
                const componentName = match.match(/^(function|const)\s+(\w+)/)[2];
                const propsMatch = match.match(/{\s*([\w\s,]+)\s*}/);

                if (propsMatch) {
                    const props = propsMatch[1].split(',').map(p => p.trim()).filter(p => p);

                    // Check if PropTypes already defined for this component
                    if (!content.includes(`${componentName}.propTypes`)) {
                        let propTypesDefinition = `\n${componentName}.propTypes = {\n`;

                        props.forEach(prop => {
                            if (prop.includes('on') || prop.includes('handle')) {
                                propTypesDefinition += `  ${prop}: PropTypes.func,\n`;
                            } else if (prop.includes('is') || prop.includes('open') || prop.includes('show')) {
                                propTypesDefinition += `  ${prop}: PropTypes.bool,\n`;
                            } else if (prop.includes('id') || prop.includes('count') || prop.includes('index')) {
                                propTypesDefinition += `  ${prop}: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),\n`;
                            } else if (prop.includes('data') || prop.includes('items') || prop.includes('list')) {
                                propTypesDefinition += `  ${prop}: PropTypes.array,\n`;
                            } else {
                                propTypesDefinition += `  ${prop}: PropTypes.any,\n`;
                            }
                        });

                        propTypesDefinition += '};\n';

                        // Add PropTypes before export default
                        if (content.includes(`export default ${componentName}`)) {
                            content = content.replace(`export default ${componentName}`, propTypesDefinition + `export default ${componentName}`);
                            modified = true;
                        }
                    }
                }
            });
        }
    }

    // Remove unused variables
    content = content.replace(/const\s+\[?\w+,?\s*\w*\]?\s*=\s*useState\([^)]*\);\s*\n(?!.*\1)/g, '');
    content = content.replace(/const\s+\w+\s*=\s*[^;\n]+;\s*\n(?!.*\1)/g, '');

    // Remove unused imports
    content = content.replace(/import\s+\{\s*\w+\s*\}\s+from\s+[^;]+;\s*\n(?!.*\1)/g, '');
    content = content.replace(/,\s*\w+(?=\s*\})/g, (match, offset, string) => {
        const imported = match.replace(/,\s*/, '');
        return string.includes(imported + '.') || string.includes(imported + '(') ? match : '';
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Added PropTypes to: ${filePath}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            traverseDirectory(filePath);
        } else if (file.endsWith('.jsx')) {
            addPropTypes(filePath);
        }
    });
}

console.log('Adding PropTypes to components...');
traverseDirectory(srcDir);
console.log('PropTypes addition complete!');