import { Selector } from 'testcafe';
import fs from 'fs';

const utilsScript = fs.readFileSync(process.cwd() + '/utils.js').toString()
const skipperScript = fs.readFileSync(process.cwd() + '/skipper.js').toString()

fixture `reddit.com`
    .page `./reddit.html`;

test('test', async t => {
    await t.eval(new Function(utilsScript));
    await t.eval(new Function(skipperScript));
    await t.eval(() => {
        doSkip(0, {});
    });
});
