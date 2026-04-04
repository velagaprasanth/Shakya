const fs = require('fs');
const file = 'src/pages/Shop/components/ShopProducts/ShopProducts.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /className=\{\\subcategory-circle-item \\\\\}/g;

content = content.replace(regex, "className={\subcategory-circle-item \\}");
content = content.replace(/className=\{\\subcategory-circle-item \\\\\}/g, "className={\subcategory-circle-item \\}");

fs.writeFileSync(file, content);
