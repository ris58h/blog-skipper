import { Selector } from 'testcafe';
import fs from 'fs';

const contentScript = fs.readFileSync(process.cwd() + '/content.js').toString()

fixture `reddit.com`
    .page `./reddit.html`;

test('My first test', async t => {
    await t
        .eval(new Function(contentScript));
    await t
        .eval(() => nextTarget(300));
});