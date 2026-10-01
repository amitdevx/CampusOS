const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/mobile/src/screens/*.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<Screen')) {
    if (!content.includes('import { Screen }')) {
      content = content.replace(/import \{.*?\} from 'react-native';/s, (match) => {
        return "import { Screen } from '../components/Screen';\n" + match;
      });
    }
    fs.writeFileSync(file, content);
  }
});
