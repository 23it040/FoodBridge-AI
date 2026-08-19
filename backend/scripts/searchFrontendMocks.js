const fs = require('fs');
const path = require('path');

const searchDir = (dir, results = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      searchDir(filePath, results);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(/(dummy|mock|fake|sample|fallback|demo)/gi);
      if (matches) {
        results.push({ filePath, count: matches.length });
      }
    }
  });
  return results;
};

const frontendPath = path.resolve(__dirname, '../../frontend/src');
const results = searchDir(frontendPath);

console.log(`Found ${results.length} files with mock/dummy/fallback keywords in frontend/src:`);
results.forEach(r => {
  console.log(`- ${path.relative(frontendPath, r.filePath)} (${r.count} matches)`);
});
